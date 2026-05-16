import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Conversation } from "@/types";

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function InboxScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { conversations } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 12,
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      flex: 1,
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    row: {
      flexDirection: "row",
      padding: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    content: { flex: 1 },
    topLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    name: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    time: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    itemTitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.primary,
      marginBottom: 2,
    },
    lastMsg: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    lastMsgUnread: {
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    badge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: {
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    thumb: {
      width: 44,
      height: 44,
      borderRadius: 6,
      backgroundColor: colors.muted,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      paddingHorizontal: 40,
    },
    bottomPad: { height: bottomPad },
  });

  const renderItem = ({ item }: { item: Conversation }) => {
    const initials = item.otherUser.name.split(" ").map((n) => n[0]).join("").toUpperCase();
    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.7}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.topLine}>
            <Text style={styles.name}>{item.otherUser.name}</Text>
            <Text style={styles.time}>{timeAgo(item.lastMessageAt)}</Text>
          </View>
          {item.item && (
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.item.title} · {item.item.price} €
            </Text>
          )}
          <Text
            style={[styles.lastMsg, item.unreadCount > 0 && styles.lastMsgUnread]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          {item.item && (
            <Image
              source={typeof item.item.images[0] === "string"
                ? { uri: item.item.images[0] }
                : item.item.images[0]}
              style={styles.thumb}
              resizeMode="cover"
            />
          )}
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Inbox</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="edit" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="message-circle" size={56} color={colors.border} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              When you buy or sell an item, your conversations will appear here.
            </Text>
          </View>
        }
        ListFooterComponent={<View style={styles.bottomPad} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
