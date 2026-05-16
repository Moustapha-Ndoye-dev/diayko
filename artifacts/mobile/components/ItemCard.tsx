import React, { useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Item } from "@/types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=60";

interface ItemCardProps {
  item: Item;
  style?: object;
}

export function ItemCard({ item, style }: ItemCardProps) {
  const colors = useColors();
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useApp();
  const liked = isFavorite(item.id);

  const imageUri =
    item.images.length > 0 ? item.images[0]! : PLACEHOLDER_IMAGE;

  const discountPct =
    item.originalPrice != null && item.originalPrice > 0
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100
        )
      : null;

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(item.id);
  }, [item.id, toggleFavorite]);

  const handlePress = useCallback(() => {
    router.push(`/item/${item.id}`);
  }, [item.id, router]);

  const styles = StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      overflow: "hidden",
    },
    imageContainer: {
      width: "100%",
      aspectRatio: 3 / 4,
      backgroundColor: colors.muted,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    likeButton: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.92)",
      alignItems: "center",
      justifyContent: "center",
    },
    discountBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: colors.primary,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    discountText: {
      color: "#fff",
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
    },
    info: {
      padding: 8,
    },
    brand: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 2,
    },
    title: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      marginBottom: 4,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    price: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    originalPrice: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textDecorationLine: "line-through",
    },
    sizeChip: {
      marginTop: 5,
      alignSelf: "flex-start",
      backgroundColor: colors.secondary,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    sizeText: {
      fontSize: 10,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} par ${item.brand}, ${item.price} FCFA`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        {discountPct !== null && discountPct >= 20 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPct}%</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLike}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Feather
            name="heart"
            size={16}
            color={liked ? "#e74c3c" : "#666"}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {item.brand}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price} FCFA</Text>
          {item.originalPrice != null && (
            <Text style={styles.originalPrice}>{item.originalPrice} FCFA</Text>
          )}
        </View>
        <View style={styles.sizeChip}>
          <Text style={styles.sizeText}>{item.size}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
