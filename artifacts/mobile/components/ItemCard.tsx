import React from "react";
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

interface ItemCardProps {
  item: Item;
  style?: object;
}

export function ItemCard({ item, style }: ItemCardProps) {
  const colors = useColors();
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useApp();
  const liked = isFavorite(item.id);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(item.id);
  };

  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : null;

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
    badge: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: colors.primary,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    badgeText: {
      color: "#fff",
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
    },
    info: {
      padding: 8,
    },
    title: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      marginBottom: 2,
    },
    brand: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
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
      marginTop: 4,
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
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={typeof item.images[0] === "string" ? { uri: item.images[0] } : item.images[0]}
          style={styles.image}
          resizeMode="cover"
        />
        {discount && discount > 30 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{discount}%</Text>
          </View>
        )}
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Feather
            name="heart"
            size={16}
            color={liked ? "#e74c3c" : "#666"}
            style={{ opacity: liked ? 1 : 0.8 }}
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
          <Text style={styles.price}>{item.price} €</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>{item.originalPrice} €</Text>
          )}
        </View>
        <View style={styles.sizeChip}>
          <Text style={styles.sizeText}>{item.size}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
