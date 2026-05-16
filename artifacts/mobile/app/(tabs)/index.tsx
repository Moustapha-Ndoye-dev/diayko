import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import { TopCategories } from "@/components/TopCategories";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { CATEGORIES } from "@/data/mockData";
import { INTERESTS } from "@/data/interests";
import { storage } from "@/lib/storage";
import { Item } from "@/types";
import { DiaykoLogo } from "@/components/DiaykoLogo";

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, isLoading } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [interestCategories, setInterestCategories] = useState<string[]>([]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    storage.interests.get().then((ids) => {
      const cats = Array.from(
        new Set(
          ids
            .map((id) => INTERESTS.find((i) => i.id === id)?.category)
            .filter((c): c is string => Boolean(c)),
        ),
      );
      setInterestCategories(cats);
    });
  }, []);

  const filtered = useMemo(() => {
    // When "All" is selected, prioritise items matching the user's interests
    // (without hiding the rest — interest matches just come first).
    if (selectedCategory === "all") {
      if (interestCategories.length === 0) return items;
      const matches = items.filter((i) => interestCategories.includes(i.category));
      const rest = items.filter((i) => !interestCategories.includes(i.category));
      return [...matches, ...rest];
    }
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory, interestCategories]);

  const pairs = useMemo(() => {
    const result: [Item, Item | undefined][] = [];
    for (let i = 0; i < filtered.length; i += 2) {
      result.push([filtered[i]!, filtered[i + 1]]);
    }
    return result;
  }, [filtered]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
    iconBtnRow: { flexDirection: "row", gap: 8 },
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
    categoryBarWrap: { marginTop: 10 },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 10,
    },
    sectionTitle: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
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
    divider: {
      height: 8,
      backgroundColor: colors.background,
      marginVertical: 4,
    },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    grid: { paddingHorizontal: 12 },
    footer: { height: Platform.OS === "web" ? 34 : 16 },
  });

  const categoryLabel =
    CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? "";

  const handleCategorySelect = useCallback((id: string) => {
    setSelectedCategory(id);
  }, []);

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <DiaykoLogo size={34} variant="full" wordmarkColor={colors.foreground} />
          <View style={styles.iconBtnRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/notifications")}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Feather name="bell" size={18} color={colors.foreground} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Saved items"
            >
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
            onSelect={handleCategorySelect}
          />
        </View>
      </View>

      <PromoCarousel />
      <View style={styles.divider} />
      <TopCategories
        selected={selectedCategory === "all" ? undefined : selectedCategory}
        onSelect={handleCategorySelect}
      />
      <View style={styles.divider} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "all"
            ? interestCategories.length > 0
              ? "For you"
              : "Latest listings"
            : categoryLabel}
        </Text>
        {!isLoading && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filtered.length} items</Text>
          </View>
        )}
      </View>

      {isLoading && <SkeletonGrid />}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={isLoading ? [] : pairs}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item: [left, right] }) => (
          <View style={styles.row}>
            <ItemCard item={left} />
            {right ? <ItemCard item={right} /> : <View style={{ flex: 1 }} />}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="shopping-bag"
              title="No items found"
              description="Try selecting a different category or check back later."
            />
          ) : null
        }
        ListFooterComponent={<View style={styles.footer} />}
      />
    </View>
  );
}
