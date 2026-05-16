import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ItemCard } from "@/components/ItemCard";
import { SearchBar } from "@/components/SearchBar";
import { SIZES, CONDITIONS } from "@/data/mockData";
import { Item } from "@/types";

const POPULAR_SEARCHES = [
  "Nike",
  "Zara",
  "Denim jacket",
  "Summer dress",
  "Sneakers",
  "Vintage",
  "H&M",
  "Levi's",
];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items } = useApp();
  const [query, setQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<Item["condition"] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    let filtered = items;
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    if (selectedSize) {
      filtered = filtered.filter((i) => i.size === selectedSize);
    }
    if (selectedCondition) {
      filtered = filtered.filter((i) => i.condition === selectedCondition);
    }
    return filtered;
  }, [items, query, selectedSize, selectedCondition]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const hasFilters = !!selectedSize || !!selectedCondition;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 12,
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    title: {
      flex: 1,
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    filterBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: hasFilters ? colors.primary : colors.border,
      backgroundColor: hasFilters ? colors.accent : colors.card,
    },
    filterBtnText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: hasFilters ? colors.primary : colors.foreground,
    },
    filtersPanel: {
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterGroup: { marginTop: 10 },
    filterLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1.5,
    },
    chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
    clearFilters: {
      marginTop: 12,
      alignSelf: "flex-start",
    },
    clearText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    popular: { padding: 16 },
    popularTitle: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 12,
    },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    tag: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.secondary,
      borderRadius: 20,
    },
    tagText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    resultsHeader: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
    },
    resultsCount: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    grid: { padding: 12 },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyTitle: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    emptyText: {
      marginTop: 6,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    bottomPad: { height: Platform.OS === "web" ? 34 : 0 },
  });

  const pairs = useMemo(() => {
    const r = [];
    for (let i = 0; i < results.length; i += 2) {
      r.push([results[i], results[i + 1]]);
    }
    return r;
  }, [results]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Search</Text>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Feather
              name="sliders"
              size={14}
              color={hasFilters ? colors.primary : colors.foreground}
            />
            <Text style={styles.filterBtnText}>Filters</Text>
          </TouchableOpacity>
        </View>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search items, brands…"
        />
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Size</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {SIZES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.chip,
                      {
                        borderColor: selectedSize === s ? colors.primary : colors.border,
                        backgroundColor: selectedSize === s ? colors.accent : colors.card,
                      },
                    ]}
                    onPress={() => setSelectedSize(selectedSize === s ? null : s)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selectedSize === s ? colors.primary : colors.foreground },
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Condition</Text>
            <View style={styles.chipRow}>
              {CONDITIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    {
                      borderColor: selectedCondition === c ? colors.primary : colors.border,
                      backgroundColor: selectedCondition === c ? colors.accent : colors.card,
                    },
                  ]}
                  onPress={() =>
                    setSelectedCondition(selectedCondition === c ? null : c)
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedCondition === c ? colors.primary : colors.foreground },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {hasFilters && (
            <TouchableOpacity
              style={styles.clearFilters}
              onPress={() => {
                setSelectedSize(null);
                setSelectedCondition(null);
              }}
            >
              <Text style={styles.clearText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!query && !hasFilters ? (
        <View style={styles.popular}>
          <Text style={styles.popularTitle}>Popular searches</Text>
          <View style={styles.tagRow}>
            {POPULAR_SEARCHES.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.tag}
                onPress={() => setQuery(s)}
              >
                <Text style={styles.tagText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={pairs}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <ItemCard item={item[0]} />
              {item[1] ? <ItemCard item={item[1]} /> : <View style={{ flex: 1 }} />}
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>{results.length} items found</Text>
            </View>
          }
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptyText}>
                Try a different search term or adjust your filters
              </Text>
            </View>
          }
          ListFooterComponent={<View style={styles.bottomPad} />}
        />
      )}
    </View>
  );
}
