import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { api, ApiMessage } from "@/lib/api";
import { AsyncState } from "@/types";

interface ChatMessage extends ApiMessage {
  isOwn: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ConversationScreen() {
  const {
    id,
    otherUserName,
    otherUserInitials,
    itemTitle,
    itemPrice,
    itemImage,
  } = useLocalSearchParams<{
    id: string;
    otherUserName?: string;
    otherUserInitials?: string;
    itemTitle?: string;
    itemPrice?: string;
    itemImage?: string;
  }>();

  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messagesState, setMessagesState] = useState<AsyncState<ChatMessage[]>>(
    { status: "loading" }
  );

  const currentUserId = "local-user";

  const loadMessages = useCallback(async () => {
    if (!id) return;
    try {
      const msgs = await api.conversations.messages(id);
      const chatMsgs: ChatMessage[] = msgs.map((m) => ({
        ...m,
        isOwn: m.senderId === currentUserId,
      }));
      setMessagesState({ status: "success", data: chatMsgs });
    } catch {
      setMessagesState({ status: "error", message: "Failed to load messages" });
    }
  }, [id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isSending || !id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText("");
    setIsSending(true);

    const optimistic: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      conversationId: id,
      senderId: currentUserId,
      text,
      createdAt: new Date().toISOString(),
      isOwn: true,
    };

    setMessagesState((prev) =>
      prev.status === "success"
        ? { status: "success", data: [...prev.data, optimistic] }
        : prev
    );

    try {
      const sent = await api.conversations.send(id, {
        senderId: currentUserId,
        text,
      });
      setMessagesState((prev) =>
        prev.status === "success"
          ? {
              status: "success",
              data: prev.data.map((m) =>
                m.id === optimistic.id ? { ...sent, isOwn: true } : m
              ),
            }
          : prev
      );
    } catch {
      setMessagesState((prev) =>
        prev.status === "success"
          ? {
              status: "success",
              data: prev.data.filter((m) => m.id !== optimistic.id),
            }
          : prev
      );
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, id]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: topPad + 8,
      paddingBottom: 12,
      paddingHorizontal: 12,
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
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    headerAvatarText: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    headerInfo: { flex: 1 },
    headerName: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    headerSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    itemBanner: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: colors.accent,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    itemThumb: {
      width: 40,
      height: 40,
      borderRadius: 6,
      backgroundColor: colors.muted,
    },
    itemBannerTitle: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    itemBannerPrice: {
      fontSize: 13,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    messagesList: { flex: 1 },
    messagesContent: {
      paddingHorizontal: 14,
      paddingVertical: 16,
      gap: 8,
    },
    messageRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    ownMessageRow: { justifyContent: "flex-end" },
    otherMessageRow: { justifyContent: "flex-start" },
    bubble: {
      maxWidth: "75%",
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    ownBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    otherBubble: {
      backgroundColor: colors.card,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ownBubbleText: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: "#fff",
    },
    otherBubbleText: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    timeText: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
      marginHorizontal: 4,
    },
    ownTimeText: { textAlign: "right" },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      padding: 12,
      paddingBottom: bottomPad + 12,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 8,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      backgroundColor: colors.secondary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: { backgroundColor: colors.muted },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View>
      <View
        style={[
          styles.messageRow,
          item.isOwn ? styles.ownMessageRow : styles.otherMessageRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            item.isOwn ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <Text
            style={item.isOwn ? styles.ownBubbleText : styles.otherBubbleText}
          >
            {item.text}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.timeText,
          item.isOwn ? styles.ownTimeText : undefined,
        ]}
      >
        {formatTime(item.createdAt)}
      </Text>
    </View>
  );

  const messages =
    messagesState.status === "success" ? messagesState.data : [];
  const canSend = inputText.trim().length > 0 && !isSending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {otherUserInitials ?? "?"}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUserName ?? "Conversation"}
          </Text>
          <Text style={styles.headerSub}>Active now</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="More options">
          <Feather name="more-horizontal" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {itemTitle ? (
        <View style={styles.itemBanner}>
          {itemImage ? (
            <Image
              source={{ uri: itemImage }}
              style={styles.itemThumb}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.itemThumb} />
          )}
          <Text style={styles.itemBannerTitle} numberOfLines={1}>
            {itemTitle}
          </Text>
          {itemPrice ? (
            <Text style={styles.itemBannerPrice}>{itemPrice} €</Text>
          ) : null}
        </View>
      ) : null}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        style={styles.messagesList}
        ListEmptyComponent={
          messagesState.status === "loading" ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : messagesState.status === "error" ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>{messagesState.message}</Text>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>
                No messages yet. Say hello!
              </Text>
            </View>
          )
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Write a message…"
          placeholderTextColor={colors.mutedForeground}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          accessibilityLabel="Message input"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
