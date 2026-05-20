import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  TextInput,
  Modal,
  Share,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { ConditionBadge } from "@/components/ConditionBadge";

const { width } = Dimensions.get("window");

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=70";

// The platform brand identity shown in place of the real seller.
const PLATFORM_NAME = "Diayko";
const PLATFORM_AVATAR = "D";
const PLATFORM_CONV_ID_PREFIX = "platform-";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, toggleFavorite, isFavorite } = useApp();
  const [isBuying, setIsBuying] = useState(false);
  const [offerModal, setOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");

  const item = items.find((i) => i.id === id);
  const liked = id ? isFavorite(id) : false;
  const isSold = item?.status === "sold";
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (id) api.items.view(id).catch(() => {});
  }, [id]);

  const handleLike = useCallback(() => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(id);
  }, [id, toggleFavorite]);

  const handleBuy = useCallback(async () => {
    if (isSold) return;
    setIsBuying(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((r) => setTimeout(r, 600));
    setIsBuying(false);
    // Navigate to the full checkout flow (FCFA, Senegalese payment methods).
    router.push({
      pathname: "/checkout/[id]",
      params: {
        id: id ?? "",
        itemTitle: item?.title ?? "",
        itemPrice: String(item?.price ?? ""),
        itemImage: item?.images[0] ?? "",
      },
    });
  }, [id, item, isSold, router]);

  const handleOffer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOfferAmount(item ? String(Math.round(item.price * 0.85)) : "");
    setOfferModal(true);
  }, [item]);

  const sendOffer = useCallback(() => {
    setOfferModal(false);
    const amount = parseFloat(offerAmount);
    if (!amount || !item) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({
      pathname: "/conversation/[id]",
      params: {
        id: `${PLATFORM_CONV_ID_PREFIX}${id}`,
        itemTitle: item.title,
        itemPrice: String(item.price),
        itemImage: item.images[0] ?? "",
        initialMessage: `💬 Offre de ${amount} FCFA pour "${item.title}" (prix affiché : ${item.price} FCFA). Votre offre a été transmise à Diayko.`,
      },
    });
  }, [offerAmount, item, id, router]);

  const handleShare = useCallback(async () => {
    if (!item) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `🛍️ ${item.title} — ${item.price} FCFA sur Diayko\nDécouvrez cet article de seconde main sur le marketplace sénégalais Diayko.`,
        title: item.title,
      });
    } catch {}
  }, [item]);

  const handleAskQuestion = useCallback(() => {
    if (!item) return;
    router.push({
      pathname: "/conversation/[id]",
      params: {
        id: `${PLATFORM_CONV_ID_PREFIX}${id}`,
        itemTitle: item.title,
        itemPrice: String(item.price),
        itemImage: item.images[0] ?? "",
      },
    });
  }, [item, id, router]);

  if (!item) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}
      >
        <ActivityIndicator color="#00853F" />
      </View>
    );
  }

  const imageUri = item.images.length > 0 ? item.images[0]! : PLACEHOLDER_IMAGE;

  const discountPct =
    item.originalPrice != null && item.originalPrice > 0
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : null;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    imageContainer: { width, aspectRatio: 3 / 4, backgroundColor: colors.muted },
    image: { width: "100%", height: "100%" },
    navBar: {
      position: "absolute",
      top: topPad + 4,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 12,
    },
    navBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.92)",
      alignItems: "center",
      justifyContent: "center",
    },
    navRight: { flexDirection: "row", gap: 8 },
    content: { padding: 16, gap: 16 },
    priceRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, flexWrap: "wrap" },
    price: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground },
    originalPrice: {
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textDecorationLine: "line-through",
      marginBottom: 2,
    },
    discountBadge: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
      backgroundColor: colors.accent,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 5,
      marginBottom: 2,
    },
    title: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    brand: { fontSize: 15, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    tag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.secondary,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    tagText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    statsRow: { flexDirection: "row", gap: 14 },
    statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    statText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    divider: { height: 1, backgroundColor: colors.border },
    sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8 },
    description: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      lineHeight: 23,
    },
    // ── Platform trust card ────────────────────────────────────────────────────
    trustCard: {
      backgroundColor: colors.accent,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.primary + "33",
      padding: 14,
      gap: 12,
    },
    trustRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    trustAvatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    trustAvatarText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
    trustInfo: { flex: 1 },
    trustName: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.primary },
    trustSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    trustBadges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    trustBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "#fff",
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    trustBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.foreground },
    askBtn: {
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      alignSelf: "flex-start",
    },
    askBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary },
    // ── Footer CTAs ────────────────────────────────────────────────────────────
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: "row",
      padding: 12,
      paddingBottom: bottomPad + 12,
      gap: 10,
    },
    offerBtn: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
    },
    offerBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.primary },
    buyBtn: {
      flex: 2,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
    },
    buyBtnDisabled: { opacity: 0.55 },
    buyBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
    // ── Offer modal ─────────────────────────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: bottomPad + 24,
      gap: 16,
    },
    modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    offerInputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.secondary,
      borderRadius: colors.radius,
      paddingHorizontal: 16,
      gap: 4,
    },
    offerCurrency: { fontSize: 22, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    offerInput: {
      flex: 1,
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      paddingVertical: 14,
    },
    sendOfferBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
    },
    sendOfferBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
    cancelBtn: { alignItems: "center", paddingVertical: 4 },
    cancelBtnText: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Retour"
            >
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.navRight}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={handleLike}
                accessibilityRole="button"
                accessibilityLabel={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Feather name="heart" size={20} color={liked ? "#e74c3c" : colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={handleShare}
                accessibilityRole="button"
                accessibilityLabel="Partager l'article"
              >
                <Feather name="share-2" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price} FCFA</Text>
            {item.originalPrice != null && (
              <Text style={styles.originalPrice}>{item.originalPrice} FCFA</Text>
            )}
            {discountPct !== null && discountPct >= 20 && (
              <Text style={styles.discountBadge}>-{discountPct}%</Text>
            )}
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.brand}>{item.brand}</Text>

          <View style={styles.tagsRow}>
            <ConditionBadge condition={item.condition} />
            <View style={styles.tag}>
              <Feather name="tag" size={12} color={colors.mutedForeground} />
              <Text style={styles.tagText}>{item.size}</Text>
            </View>
            {item.color && (
              <View style={styles.tag}>
                <Feather name="droplet" size={12} color={colors.mutedForeground} />
                <Text style={styles.tagText}>{item.color}</Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="heart" size={14} color={colors.mutedForeground} />
              <Text style={styles.statText}>{item.likesCount + (liked ? 1 : 0)}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="eye" size={14} color={colors.mutedForeground} />
              <Text style={styles.statText}>{item.viewsCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="clock" size={14} color={colors.mutedForeground} />
              <Text style={styles.statText}>{item.postedAt}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* ── Platform trust block (replaces seller identity) ─────────────── */}
          <View>
            <Text style={styles.sectionTitle}>Vendu par</Text>
            <View style={styles.trustCard}>
              <View style={styles.trustRow}>
                <View style={styles.trustAvatar}>
                  <Text style={styles.trustAvatarText}>{PLATFORM_AVATAR}</Text>
                </View>
                <View style={styles.trustInfo}>
                  <Text style={styles.trustName}>{PLATFORM_NAME}</Text>
                  <Text style={styles.trustSub}>Marketplace officielle · Acheteur protégé</Text>
                </View>
                <Feather name="check-circle" size={20} color={colors.primary} />
              </View>
              <View style={styles.trustBadges}>
                <View style={styles.trustBadge}>
                  <Feather name="lock" size={12} color={colors.primary} />
                  <Text style={styles.trustBadgeText}>Paiement sécurisé</Text>
                </View>
                <View style={styles.trustBadge}>
                  <Feather name="refresh-cw" size={12} color={colors.primary} />
                  <Text style={styles.trustBadgeText}>Retours faciles</Text>
                </View>
                <View style={styles.trustBadge}>
                  <Feather name="headphones" size={12} color={colors.primary} />
                  <Text style={styles.trustBadgeText}>Support 24h/24</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.askBtn}
                onPress={handleAskQuestion}
                accessibilityRole="button"
                accessibilityLabel="Poser une question"
              >
                <Text style={styles.askBtnText}>Poser une question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.offerBtn}
          onPress={handleOffer}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Faire une offre"
        >
          <Text style={styles.offerBtnText}>Faire offre</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyBtn, isSold && styles.buyBtnDisabled]}
          onPress={handleBuy}
          disabled={isSold}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isSold ? "Article vendu" : `Acheter pour ${item.price} FCFA`}
        >
          {isBuying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buyBtnText}>
              {isSold ? "Article vendu" : `Acheter - ${item.price} FCFA`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Offer bottom sheet ───────────────────────────────────────────────── */}
      <Modal
        visible={offerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setOfferModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setOfferModal(false)}
          />
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Faire une offre</Text>
            <Text style={styles.modalSub}>
              Prix affiché : {item.price} FCFA. Entrez votre offre ci-dessous.
            </Text>
            <View style={styles.offerInputRow}>
              <Text style={styles.offerCurrency}>F</Text>
              <TextInput
                style={styles.offerInput}
                value={offerAmount}
                onChangeText={(v) => setOfferAmount(v.replace(/[^0-9.]/g, ""))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={styles.sendOfferBtn}
              onPress={sendOffer}
              disabled={!offerAmount || parseFloat(offerAmount) <= 0}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Envoyer l'offre"
            >
              <Text style={styles.sendOfferBtnText}>Envoyer l'offre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setOfferModal(false)}
              accessibilityRole="button"
              accessibilityLabel="Annuler"
            >
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
