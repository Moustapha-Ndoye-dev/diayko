import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { CATEGORIES } from "@/data/mockData";

interface TopCategoriesProps {
  selected?: string;
  onSelect?: (id: string) => void;
}

// Stable palette indexed by category id to avoid flicker on re-render.
const CATEGORY_COLORS: Record<string, string> = {
  women: "#FFE0EC",
  men: "#DDE7FF",
  kids: "#FFF1D6",
  shoes: "#E4DBFF",
  bags: "#FFD9C2",
  accessories: "#D7F5EC",
  sport: "#FFD3D3",
};

const ICON_COLORS: Record<string, string> = {
  women: "#E91E63",
  men: "#3B6BFF",
  kids: "#F2A60E",
  shoes: "#6C5CE7",
  bags: "#E8651A",
  accessories: "#0EA371",
  sport: "#E53935",
};

export function TopCategories({ selected, onSelect }: TopCategoriesProps) {
  const colors = useColors();
  const list = CATEGORIES.filter((c) => c.id !== "all");

  const styles = StyleSheet.create({
    container: { marginBottom: 4 },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    label: {
      flex: 1,
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    seeAll: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    scroll: { paddingLeft: 16, paddingRight: 4 },
    card: {
      width: 76,
      alignItems: "center",
      marginRight: 10,
      gap: 8,
    },
    iconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    iconCircleSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    name: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      textAlign: "center",
    },
    nameSelected: {
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Top Categories</Text>
        <Text style={styles.seeAll}>See all</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {list.map((cat) => {
          const bg = CATEGORY_COLORS[cat.id] ?? colors.accent;
          const iconColor = ICON_COLORS[cat.id] ?? colors.primary;
          const isSelected = selected === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.card}
              onPress={() => onSelect?.(cat.id)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Category ${cat.label}`}
              accessibilityState={{ selected: isSelected }}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: bg },
                  isSelected && styles.iconCircleSelected,
                ]}
              >
                <Feather
                  name={cat.icon as keyof typeof Feather.glyphMap}
                  size={24}
                  color={iconColor}
                />
              </View>
              <Text
                style={[styles.name, isSelected && styles.nameSelected]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
