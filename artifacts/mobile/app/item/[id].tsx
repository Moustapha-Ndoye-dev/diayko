import React, { useState } from "react";
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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ConditionBadge } from "@/components/ConditionBadge";
import { StarRating } from "@/components/StarRating";

const { width } = Dimensions.get("window");

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, toggleFavorite, isFavorite } = useApp();
  const item = items.find((i) => i.id === id);
  const [buying, setBuying] = useState(false);
  const [offering, setOffering] = useState(false);

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Item not found</Text>
      </View>
    );
  }

  const liked = isFavorite(item.id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleBuy = async () => {
    setBuying(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((r) => setTimeout(r, 600));
    setBuying(false);
    Alert.alert("Order placed!", "Your order has been confirmed. The seller will ship soon.");
  };

  const handleOffer = () => {
    setOffering(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Make an offer",
      `Enter an offer for ${item.title} (listed at ${item.price} €)`,
      [
        { text: "Cancel", onPress: () => setOffering(false), style: "cancel" },
        { text: "Send offer", onPress: () => { setOffering(false); Alert.alert("Offer sent!", "The seller will respond soon."); } },
      ]
    );
  };

  const sellerInitials = item.seller.name.split(" ").map((n) => n[0]).join("").toUpperCase();

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
    discount: {
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
    divider: { height: 1, backgroundColor: colors.border },
    sectionTitle: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 6,
    },
    description: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      lineHeight: 22,
    },
    sellerCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
    sellerInfo: { flex: 1, gap: 2 },
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
    statsRow: {
      flexDirection: "row",
      gap: 16,
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

  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={typeof item.images[0] === "string" ? { uri: item.images[0] } : item.images[0]}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.navBar}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.navRight}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleFavorite(item.id);
                }}
              >
                <Feather
                  name="heart"
                  size={20}
                  color={liked ? "#e74c3c" : colors.foreground}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}>
                <Feather name="share-2" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price} €</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>{item.originalPrice} €</Text>
            )}
            {discount && discount > 20 && (
              <Text style={styles.discount}>-{discount}%</Text>
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
              <Text style={styles.statText}>{item.likes + (liked ? 1 : 0)}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="eye" size={14} color={colors.mutedForeground} />
              <Text style={styles.statText}>{item.views}</Text>
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
            <TouchableOpacity style={styles.sellerCard} activeOpacity={0.8}>
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
                  {item.seller.itemCount} items · Member since {item.seller.joinedAt.slice(0, 4)}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.offerBtn}
          onPress={handleOffer}
          activeOpacity={0.8}
        >
          <Text style={styles.offerBtnText}>Make offer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={handleBuy}
          activeOpacity={0.8}
        >
          <Text style={styles.buyBtnText}>
            {buying ? "Processing…" : `Buy · ${item.price} €`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
