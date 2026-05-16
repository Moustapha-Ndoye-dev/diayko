import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { AppNotification, NotificationType } from "@/types";

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

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "message",
    title: "New message from Emma Wilson",
    body: "Is the jacket still available?",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "n2",
    type: "like",
    title: "Someone liked your item",
    body: 'Your "Classic Denim Jacket" received a new like.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    itemId: "i1",
  },
  {
    id: "n3",
    type: "price_drop",
    title: "Price drop on a saved item",
    body: '"Air Force 1 White" dropped from €75 to €65.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    itemId: "i4",
  },
  {
    id: "n4",
    type: "sale",
    title: "Summer Sale is live",
    body: "Up to 70% off on selected items. Don't miss out!",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "n5",
    type: "order",
    title: "Order confirmed",
    body: "Your purchase of the Camel Coat is confirmed. The seller will ship soon.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] =
    useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
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
    markAllBtn: {
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
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
    unreadRow: {
      backgroundColor: colors.accent,
    },
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
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingBottom: 100,
    },
    emptyTitle: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
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
          <Text style={styles.notifTime}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllRead}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </View>
        }
        ListFooterComponent={<View style={styles.listFooter} />}
      />
    </View>
  );
}
