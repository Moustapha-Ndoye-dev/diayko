import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { api, type ApiNotification } from "@/lib/api";
import type { AppNotification, NotificationType } from "@/types";

const ICON_FOR_TYPE: Record<NotificationType, string> = {
  message: "message-circle",
  like: "heart",
  sale: "tag",
  price_drop: "trending-down",
  order: "package",
};

const COLOR_FOR_TYPE: Record<NotificationType, string> = {
  message: "#00853F",
  like: "#e74c3c",
  sale: "#6c5ce7",
  price_drop: "#fd79a8",
  order: "#00b894",
};

function inferType(notification: ApiNotification): NotificationType {
  const text = `${notification.title} ${notification.body}`.toLowerCase();
  if (text.includes("message")) return "message";
  if (text.includes("favori") || text.includes("like")) return "like";
  if (text.includes("vente")) return "sale";
  if (text.includes("prix")) return "price_drop";
  return "order";
}

function toAppNotification(notification: ApiNotification): AppNotification {
  return {
    id: notification.id,
    type: inferType(notification),
    title: notification.title,
    body: notification.body,
    isRead: notification.read,
    createdAt: notification.createdAt,
  };
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "a l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.notifications.list();
      setNotifications(res.notifications.map(toAppNotification));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await api.notifications.markAllRead().catch(() => undefined);
  };

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    await api.notifications.read(id).catch(() => undefined);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: topPad + 8,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    markAllBtn: { paddingVertical: 6, paddingHorizontal: 4 },
    markAllText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    notifRow: {
      flexDirection: "row",
      padding: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
      gap: 12,
      alignItems: "flex-start",
    },
    unreadRow: { backgroundColor: colors.accent },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    notifContent: { flex: 1, gap: 3 },
    notifTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    notifBody: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    notifTime: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: 32,
      paddingBottom: 100,
    },
    emptyTitle: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    retryBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    retryText: { color: "#fff", fontFamily: "Inter_600SemiBold" },
    listFooter: { height: bottomPad + 16 },
  });

  const renderItem = ({ item }: { item: AppNotification }) => {
    const iconColor = COLOR_FOR_TYPE[item.type];
    const iconName = ICON_FOR_TYPE[item.type];

    return (
      <TouchableOpacity
        style={[styles.notifRow, !item.isRead && styles.unreadRow]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={item.title}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
          <Feather name={iconName as any} size={20} color={iconColor} />
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifBody} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.notifTime}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const emptyState = error ? (
    <View style={styles.center}>
      <Feather name="wifi-off" size={48} color={colors.border} />
      <Text style={styles.emptyTitle}>Notifications indisponibles</Text>
      <Text style={styles.emptyText}>Impossible de synchroniser avec l'API.</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={loadNotifications}>
        <Text style={styles.retryText}>Reessayer</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.center}>
      <Feather name="bell-off" size={48} color={colors.border} />
      <Text style={styles.emptyTitle}>Aucune notification</Text>
      <Text style={styles.emptyText}>Vous etes a jour.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllRead}
            accessibilityRole="button"
            accessibilityLabel="Tout marquer comme lu"
          >
            <Text style={styles.markAllText}>Tout marquer lu</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={emptyState}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      )}
    </View>
  );
}
