import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Item } from "@/types";

const CONDITION_COLORS: Record<Item["condition"], { bg: string; text: string }> = {
  "New with tags": { bg: "#e8f9f0", text: "#27ae60" },
  "Like new": { bg: "#e8f4fd", text: "#2980b9" },
  Good: { bg: "#fef9e7", text: "#f39c12" },
  Fair: { bg: "#fdf2f0", text: "#e74c3c" },
};

interface ConditionBadgeProps {
  condition: Item["condition"];
}

export function ConditionBadge({ condition }: ConditionBadgeProps) {
  const c = CONDITION_COLORS[condition];

  const styles = StyleSheet.create({
    badge: {
      alignSelf: "flex-start",
      backgroundColor: c.bg,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    text: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: c.text,
    },
  });

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{condition}</Text>
    </View>
  );
}
