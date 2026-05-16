import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Category } from "@/types";

interface CategoryPillProps {
  category: Category;
  selected: boolean;
  onPress: () => void;
}

function CategoryPill({ category, selected, onPress }: CategoryPillProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    pill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: selected ? colors.primary : colors.border,
      backgroundColor: selected ? colors.primary : colors.card,
      gap: 5,
    },
    label: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: selected ? colors.primaryForeground : colors.foreground,
    },
  });

  return (
    <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.7}>
      <Ionicons
        name={category.icon as keyof typeof Ionicons.glyphMap}
        size={15}
        color={selected ? colors.primaryForeground : colors.mutedForeground}
      />
      <Text style={styles.label}>{category.label}</Text>
    </TouchableOpacity>
  );
}

interface CategoryBarProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryBar({ categories, selected, onSelect }: CategoryBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingVertical: 2 }}
    >
      {categories.map((cat) => (
        <CategoryPill
          key={cat.id}
          category={cat}
          selected={selected === cat.id}
          onPress={() => onSelect(cat.id)}
        />
      ))}
    </ScrollView>
  );
}
