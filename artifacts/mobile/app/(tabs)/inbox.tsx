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
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/EmptyState";
import { Conversation } from "@/types";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&q=60";

export default function InboxScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { conversations } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 12,
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    headerTitle: {
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
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
    content: { flex: 1 },
    topLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    senderName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    time: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    itemLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.primary,
      marginBottom: 2,
    },
    lastMessage: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    lastMessageUnread: {
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    rightColumn: { alignItems: "flex-end", gap: 6 },
    thumb: {
      width: 44,
      height: 44,
      borderRadius: 6,
      backgroundColor: colors.muted,
    },
    unreadBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    unreadBadgeText: {
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    footer: { height: bottomPad + 16 },
  });

  const AVATAR_COLORS = [
    "#09B1BA",
    "#6c5ce7",
    "#fd79a8",
    "#00b894",
    "#fdcb6e",
  ];

  const navigateToConversation = (conv: Conversation) => {
    const initials = conv.otherUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    router.push({
      pathname: "/conversation/[id]",
      params: {
        id: conv.id,
        otherUserName: conv.otherUser.name,
        otherUserInitials: initials,
        itemTitle: conv.item?.title ?? "",
        itemPrice: conv.item?.price?.toString() ?? "",
        itemImage: conv.item?.images[0] ?? "",
      },
    });
  };

  const renderItem = ({ item: conv, index }: { item: Conversation; index: number }) => {
    const initials = conv.otherUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length]!;
    const thumbUri =
      conv.item?.images[0] ??
      (conv.item ? PLACEHOLDER_IMAGE : undefined);

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigateToConversation(conv)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Conversation with ${conv.otherUser.name}`}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.topLine}>
            <Text style={styles.senderName}>{conv.otherUser.name}</Text>
            {conv.lastMessageAt && (
              <Text style={styles.time}>
                {formatRelativeTime(conv.lastMessageAt)}
              </Text>
            )}
          </View>
          {conv.item && (
            <Text style={styles.itemLabel} numberOfLines={1}>
              {conv.item.title} · {conv.item.price} €
            </Text>
          )}
          {conv.lastMessage && (
            <Text
              style={[
                styles.lastMessage,
                conv.unreadCount > 0 && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {conv.lastMessage}
            </Text>
          )}
        </View>
        <View style={styles.rightColumn}>
          {thumbUri && (
            <Image
              source={{ uri: thumbUri }}
              style={styles.thumb}
              resizeMode="cover"
            />
          )}
          {conv.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{conv.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="New message"
        >
          <Feather name="edit" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="message-circle"
            title="No messages yet"
            description="When you buy or sell an item, your conversations will appear here."
          />
        }
        ListFooterComponent={<View style={styles.footer} />}
      />
    </View>
  );
}
