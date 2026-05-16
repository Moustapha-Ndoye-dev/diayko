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
import { censorMessage, hasCensoredContent } from "@/lib/censor";

// ── Platform identity ────────────────────────────────────────────────────────
const PLATFORM_NAME = "Diayko";
const PLATFORM_AVATAR = "D";
const PLATFORM_STATUS = "Support officiel · Répond en quelques minutes";

interface ChatMessage extends ApiMessage {
  isOwn: boolean;
  /** System / platform message displayed differently */
  isSystem?: boolean;
  /** Original text before censorship (used to show the warning) */
  wasCensored?: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ConversationScreen() {
  const {
    id,
    itemTitle,
    itemPrice,
    itemImage,
    initialMessage,
  } = useLocalSearchParams<{
    id: string;
    itemTitle?: string;
    itemPrice?: string;
    itemImage?: string;
    /** Pre-injected platform message (offer confirmation, order update, etc.) */
    initialMessage?: string;
  }>();

  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messagesState, setMessagesState] = useState<AsyncState<ChatMessage[]>>({ status: "loading" });

  const currentUserId = "local-user";

  const loadMessages = useCallback(async () => {
    if (!id) return;

    // "platform-*" conversations are local-only (not backed by a real conversation ID yet).
    const isPlatformConv = id.startsWith("platform-");

    const systemMessages: ChatMessage[] = [];

    // Inject platform welcome for new conversations.
    if (isPlatformConv) {
      systemMessages.push({
        id: "sys-welcome",
        conversationId: id,
        senderId: "platform",
        text: "Bonjour 👋 Bienvenue chez Diayko. Comment pouvons-nous vous aider ?",
        createdAt: new Date(Date.now() - 2000).toISOString(),
        isOwn: false,
        isSystem: true,
      });
    }

    if (initialMessage) {
      systemMessages.push({
        id: "sys-initial",
        conversationId: id,
        senderId: "platform",
        text: initialMessage,
        createdAt: new Date(Date.now() - 1000).toISOString(),
        isOwn: false,
        isSystem: true,
      });
    }

    if (isPlatformConv) {
      setMessagesState({ status: "success", data: systemMessages });
      return;
    }

    try {
      const msgs = await api.conversations.messages(id);
      const chatMsgs: ChatMessage[] = [
        ...systemMessages,
        ...msgs.map((m) => {
          const censored = censorMessage(m.text);
          return {
            ...m,
            text: censored,
            isOwn: m.senderId === currentUserId,
            wasCensored: hasCensoredContent(m.text, censored),
          };
        }),
      ];
      setMessagesState({ status: "success", data: chatMsgs });
    } catch {
      setMessagesState({ status: "error", message: "Impossible de charger les messages" });
    }
  }, [id, initialMessage]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSend = useCallback(async () => {
    const raw = inputText.trim();
    if (!raw || isSending || !id) return;

    // Censor before sending and before adding to local state.
    const censored = censorMessage(raw);
    const didCensor = hasCensoredContent(raw, censored);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText("");
    setIsSending(true);

    const optimistic: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      conversationId: id,
      senderId: currentUserId,
      text: censored,
      createdAt: new Date().toISOString(),
      isOwn: true,
      wasCensored: didCensor,
    };

    setMessagesState((prev) =>
      prev.status === "success"
        ? { status: "success", data: [...prev.data, optimistic] }
        : prev
    );

    // If this is a platform-only conversation, simulate a reply after a brief delay.
    const isPlatformConv = id.startsWith("platform-");
    if (isPlatformConv) {
      setTimeout(() => {
        const reply: ChatMessage = {
          id: `reply-${Date.now()}`,
          conversationId: id,
          senderId: "platform",
          text: "Merci pour votre message ! Notre équipe va examiner votre demande et vous répondra rapidement.",
          createdAt: new Date().toISOString(),
          isOwn: false,
          isSystem: true,
        };
        setMessagesState((prev) =>
          prev.status === "success"
            ? { status: "success", data: [...prev.data, reply] }
            : prev
        );
      }, 1500);
      setIsSending(false);
      return;
    }

    try {
      const sent = await api.conversations.send(id, { senderId: currentUserId, text: censored });
      setMessagesState((prev) =>
        prev.status === "success"
          ? {
              status: "success",
              data: prev.data.map((m) =>
                m.id === optimistic.id ? { ...sent, isOwn: true, text: censored, wasCensored: didCensor } : m
              ),
            }
          : prev
      );
    } catch {
      setMessagesState((prev) =>
        prev.status === "success"
          ? { status: "success", data: prev.data.filter((m) => m.id !== optimistic.id) }
          : prev
      );
      setInputText(raw);
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
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    headerAvatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
    headerInfo: { flex: 1 },
    headerName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.primary },
    itemBanner: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: colors.accent,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    itemThumb: { width: 40, height: 40, borderRadius: 6, backgroundColor: colors.muted },
    itemBannerTitle: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    itemBannerPrice: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary },
    messagesList: { flex: 1 },
    messagesContent: { paddingHorizontal: 14, paddingVertical: 16, gap: 8 },
    messageRow: { flexDirection: "row", marginBottom: 4 },
    ownMessageRow: { justifyContent: "flex-end" },
    otherMessageRow: { justifyContent: "flex-start" },
    bubble: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    ownBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    otherBubble: {
      backgroundColor: colors.card,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    systemBubble: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary + "33",
    },
    ownBubbleText: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#fff" },
    otherBubbleText: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground },
    systemBubbleText: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground },
    timeText: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
      marginHorizontal: 4,
    },
    ownTimeText: { textAlign: "right" },
    censorNotice: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: "#e74c3c",
      marginTop: 2,
      marginHorizontal: 4,
    },
    ownCensorNotice: { textAlign: "right" },
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
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    errorText: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" },
  });

  const renderMessage = ({ item: msg }: { item: ChatMessage }) => (
    <View>
      <View
        style={[
          styles.messageRow,
          msg.isOwn ? styles.ownMessageRow : styles.otherMessageRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            msg.isOwn ? styles.ownBubble : msg.isSystem ? styles.systemBubble : styles.otherBubble,
          ]}
        >
          <Text style={msg.isOwn ? styles.ownBubbleText : msg.isSystem ? styles.systemBubbleText : styles.otherBubbleText}>
            {msg.text}
          </Text>
        </View>
      </View>
      {msg.wasCensored && (
        <Text style={[styles.censorNotice, msg.isOwn && styles.ownCensorNotice]}>
          ⚠️ Informations de contact supprimées — échangez uniquement via Diayko.
        </Text>
      )}
      <Text style={[styles.timeText, msg.isOwn ? styles.ownTimeText : undefined]}>
        {formatTime(msg.createdAt)}
      </Text>
    </View>
  );

  const messages = messagesState.status === "success" ? messagesState.data : [];
  const canSend = inputText.trim().length > 0 && !isSending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── Header — always shows Vinted, never the real seller ─────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{PLATFORM_AVATAR}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {PLATFORM_NAME}
          </Text>
          <Text style={styles.headerSub}>{PLATFORM_STATUS}</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Plus d'options">
          <Feather name="more-horizontal" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* ── Item context banner ──────────────────────────────────────────────── */}
      {itemTitle ? (
        <View style={styles.itemBanner}>
          {itemImage ? (
            <Image source={{ uri: itemImage }} style={styles.itemThumb} resizeMode="cover" />
          ) : (
            <View style={styles.itemThumb} />
          )}
          <Text style={styles.itemBannerTitle} numberOfLines={1}>
            {itemTitle}
          </Text>
          {itemPrice ? (
            <Text style={styles.itemBannerPrice}>{itemPrice} FCFA</Text>
          ) : null}
        </View>
      ) : null}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(msg) => msg.id}
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
              <Text style={styles.errorText}>Envoyez votre premier message.</Text>
            </View>
          )
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Écrire un message…"
          placeholderTextColor={colors.mutedForeground}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          accessibilityLabel="Champ de saisie du message"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Envoyer le message"
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
