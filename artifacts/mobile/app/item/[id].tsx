import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { ConditionBadge } from "@/components/ConditionBadge";
import { StarRating } from "@/components/StarRating";

const { width } = Dimensions.get("window");

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=70";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, toggleFavorite, isFavorite } = useApp();
  const [isBuying, setIsBuying] = useState(false);

  const item = items.find((i) => i.id === id);

  const liked = id ? isFavorite(id) : false;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Track view on mount
  useEffect(() => {
    if (id) {
      api.items.view(id).catch(() => {});
    }
  }, [id]);

  const handleLike = useCallback(() => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(id);
  }, [id, toggleFavorite]);

  const handleBuy = useCallback(async () => {
    setIsBuying(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((r) => setTimeout(r, 800));
    setIsBuying(false);
    Alert.alert(
      "Order placed!",
      "Your order has been confirmed. The seller will ship soon."
    );
  }, []);

  const handleOffer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Make an offer",
      `Enter an offer for "${item?.title ?? "this item"}" (listed at ${item?.price ?? 0} €)`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send offer",
          onPress: () =>
            Alert.alert("Offer sent!", "The seller will respond soon."),
        },
      ]
    );
  }, [item]);

  const handleContactSeller = useCallback(async () => {
    if (!item) return;
    // Navigate to conversation — in a real app we'd create or find existing conv
    const initials = item.seller.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    router.push({
      pathname: "/conversation/[id]",
      params: {
        id: `new-${item.seller.id}`,
        otherUserName: item.seller.name,
        otherUserInitials: initials,
        itemTitle: item.title,
        itemPrice: String(item.price),
        itemImage: item.images[0] ?? "",
      },
    });
  }, [item, router]);

  const handleViewSeller = useCallback(() => {
    if (!item) return;
    router.push(`/seller/${item.seller.id}`);
  }, [item, router]);

  if (!item) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const imageUri = item.images.length > 0 ? item.images[0]! : PLACEHOLDER_IMAGE;
  const sellerInitials = item.seller.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const discountPct =
    item.originalPrice != null && item.originalPrice > 0
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100
        )
      : null;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    imageContainer: {
      width,
      aspectRatio: 3 / 4,
      backgroundColor: colors.muted,
    },
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
    priceRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      flexWrap: "wrap",
    },
    price: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
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
    title: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    brand: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    tag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.secondary,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    tagText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    statsRow: {
      flexDirection: "row",
      gap: 14,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    divider: { height: 1, backgroundColor: colors.border },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 8,
    },
    description: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      lineHeight: 23,
    },
    sellerCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.secondary,
      borderRadius: colors.radius,
      padding: 14,
      gap: 12,
    },
    sellerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sellerAvatarText: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    sellerInfo: { flex: 1, gap: 3 },
    sellerName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    sellerSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    contactBtn: {
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    contactBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
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
    offerBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    buyBtn: {
      flex: 2,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
    },
    buyBtnText: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.navRight}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={handleLike}
                accessibilityRole="button"
                accessibilityLabel={
                  liked ? "Remove from favourites" : "Add to favourites"
                }
              >
                <Feather
                  name="heart"
                  size={20}
                  color={liked ? "#e74c3c" : colors.foreground}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navBtn}
                accessibilityRole="button"
                accessibilityLabel="Share item"
              >
                <Feather name="share-2" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price} €</Text>
            {item.originalPrice != null && (
              <Text style={styles.originalPrice}>{item.originalPrice} €</Text>
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
                <Feather
                  name="droplet"
                  size={12}
                  color={colors.mutedForeground}
                />
                <Text style={styles.tagText}>{item.color}</Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="heart" size={14} color={colors.mutedForeground} />
              <Text style={styles.statText}>
                {item.likesCount + (liked ? 1 : 0)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="eye" size={14} color={colors.mutedForeground} />
              <Text style={styles.statText}>{item.viewsCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather
                name="clock"
                size={14}
                color={colors.mutedForeground}
              />
              <Text style={styles.statText}>{item.postedAt}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          <View style={styles.divider} />

          <View>
            <Text style={styles.sectionTitle}>Seller</Text>
            <TouchableOpacity
              style={styles.sellerCard}
              onPress={handleViewSeller}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`View ${item.seller.name}'s profile`}
            >
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerAvatarText}>{sellerInitials}</Text>
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{item.seller.name}</Text>
                <StarRating
                  rating={item.seller.rating}
                  count={item.seller.reviewCount}
                  size={13}
                />
                <Text style={styles.sellerSub}>
                  {item.seller.itemCount} items · Since{" "}
                  {item.seller.joinedAt.slice(0, 4)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={handleContactSeller}
                accessibilityRole="button"
                accessibilityLabel="Contact seller"
              >
                <Text style={styles.contactBtnText}>Contact</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.offerBtn}
          onPress={handleOffer}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Make an offer"
        >
          <Text style={styles.offerBtnText}>Make offer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={handleBuy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Buy for ${item.price} euros`}
        >
          {isBuying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buyBtnText}>Buy · {item.price} €</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
