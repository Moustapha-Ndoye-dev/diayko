import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
}

export function StarRating({ rating, count, size = 14 }: StarRatingProps) {
  return (
    <View style={styles.row}>
      <Feather name="star" size={size} color="#f39c12" />
      <Text style={[styles.rating, { fontSize: size }]}>{rating.toFixed(1)}</Text>
      {count !== undefined && (
        <Text style={[styles.count, { fontSize: size - 2 }]}>({count})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontFamily: "Inter_600SemiBold",
    color: "#1a1a1a",
  },
  count: {
    fontFamily: "Inter_400Regular",
    color: "#888",
  },
});
