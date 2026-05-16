import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ItemCard } from "@/components/ItemCard";
import { CategoryBar } from "@/components/CategoryPill";
import { SearchBar } from "@/components/SearchBar";
import { PromoCarousel } from "@/components/PromoCarousel";
import { FeaturedSellers } from "@/components/FeaturedSellers";
import { CATEGORIES } from "@/data/mockData";

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((i) => i.category === selectedCategory);
  }, [items, selectedCategory]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: topPad + 12,
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    logo: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      flex: 1,
      letterSpacing: -0.5,
    },
    iconBtnRow: {
      flexDirection: "row",
      gap: 8,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    notifDot: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      borderWidth: 1.5,
      borderColor: colors.card,
    },
    categoryBarWrap: {
      marginTop: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 10,
    },
    sectionTitle: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    seeAll: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    divider: {
      height: 8,
      backgroundColor: colors.background,
      marginVertical: 8,
    },
    grid: {
      paddingHorizontal: 12,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    bottomPad: {
      height: Platform.OS === "web" ? 34 : 16,
    },
    countBadge: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    countText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
  });

  const pairs = useMemo(() => {
    const result: (typeof filtered)[] = [];
    for (let i = 0; i < filtered.length; i += 2) {
      result.push([filtered[i], filtered[i + 1]].filter(Boolean) as typeof filtered);
    }
    return result;
  }, [filtered]);

  const renderHeader = () => (
    <View>
      {/* Top header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Text style={styles.logo}>vinted</Text>
          <View style={styles.iconBtnRow}>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="bell" size={18} color={colors.foreground} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="bookmark" size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
        <SearchBar
          value=""
          onChangeText={() => {}}
          onPress={() => router.push("/(tabs)/search")}
          editable={false}
        />
        <View style={styles.categoryBarWrap}>
          <CategoryBar
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>
      </View>

      {/* Promo carousel */}
      <PromoCarousel />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Top sellers */}
      <FeaturedSellers />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Section title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "all"
            ? "Latest listings"
            : CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? ""}
        </Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length} items</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pairs}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ItemCard item={item[0]} />
            {item[1] ? <ItemCard item={item[1]} /> : <View style={{ flex: 1 }} />}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="shopping-bag" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
        ListFooterComponent={<View style={styles.bottomPad} />}
      />
    </View>
  );
}
