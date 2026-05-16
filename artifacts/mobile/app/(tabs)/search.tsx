import React, { useState, useMemo, useCallback } from "react";
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
import { useDebounce } from "@/hooks/useDebounce";
import { ItemCard } from "@/components/ItemCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { SIZES, CONDITIONS, conditionLabel, sizeLabel } from "@/data/mockData";
import { Item, Condition } from "@/types";

const POPULAR_SEARCHES = [
  "Nike",
  "Zara",
  "Veste en jean",
  "Robe d'été",
  "Baskets",
  "Wax",
  "H&M",
  "Levi's",
];

interface Filters {
  size: string | null;
  condition: Condition | null;
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items } = useApp();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    size: null,
    condition: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 49;

  const hasFilters = filters.size !== null || filters.condition !== null;

  const results = useMemo(() => {
    let filtered = items;
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }
    if (filters.size) {
      filtered = filtered.filter((item) => item.size === filters.size);
    }
    if (filters.condition) {
      filtered = filtered.filter(
        (item) => item.condition === filters.condition
      );
    }
    return filtered;
  }, [items, debouncedQuery, filters]);

  const pairs = useMemo(() => {
    const result: [Item, Item | undefined][] = [];
    for (let i = 0; i < results.length; i += 2) {
      result.push([results[i]!, results[i + 1]]);
    }
    return result;
  }, [results]);

  const setSize = useCallback((size: string) => {
    setFilters((prev) => ({ ...prev, size: prev.size === size ? null : size }));
  }, []);

  const setCondition = useCallback((condition: Condition) => {
    setFilters((prev) => ({
      ...prev,
      condition: prev.condition === condition ? null : condition,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ size: null, condition: null });
  }, []);

  const isSearching = debouncedQuery.trim().length > 0 || hasFilters;

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
      fontSize: 22,
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
    filterGroup: { marginTop: 12 },
    filterLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1.5,
    },
    chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
    clearBtn: { marginTop: 10, alignSelf: "flex-start" },
    clearText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    popular: { padding: 16 },
    popularTitle: {
      fontSize: 16,
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
    footer: { height: bottomPad + 16 },
  });

  const chip = (
    label: string,
    selected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.chip,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.accent : colors.card,
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? colors.primary : colors.foreground },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Recherche</Text>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilters((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="Afficher les filtres"
            accessibilityState={{ expanded: showFilters }}
          >
            <Feather
              name="sliders"
              size={14}
              color={hasFilters ? colors.primary : colors.foreground}
            />
            <Text style={styles.filterBtnText}>Filtres</Text>
            {hasFilters && (
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.primary,
                }}
              />
            )}
          </TouchableOpacity>
        </View>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher articles, marques…"
        />
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Taille</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {SIZES.map((s) =>
                  chip(sizeLabel(s), filters.size === s, () => setSize(s))
                )}
              </View>
            </ScrollView>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>État</Text>
            <View style={styles.chipRow}>
              {CONDITIONS.map((c) =>
                chip(conditionLabel(c), filters.condition === c, () => setCondition(c))
              )}
            </View>
          </View>
          {hasFilters && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={clearFilters}
              accessibilityRole="button"
              accessibilityLabel="Effacer les filtres"
            >
              <Text style={styles.clearText}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!isSearching ? (
        <View style={styles.popular}>
          <Text style={styles.popularTitle}>Recherches populaires</Text>
          <View style={styles.tagRow}>
            {POPULAR_SEARCHES.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.tag}
                onPress={() => setQuery(s)}
                accessibilityRole="button"
                accessibilityLabel={`Rechercher ${s}`}
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
          renderItem={({ item: [left, right] }) => (
            <View style={styles.row}>
              <ItemCard item={left} />
              {right ? (
                <ItemCard item={right} />
              ) : (
                <View style={{ flex: 1 }} />
              )}
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>{results.length} résultat{results.length > 1 ? "s" : ""}</Text>
            </View>
          }
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="Aucun résultat"
              description="Essayez un autre terme de recherche ou ajustez vos filtres."
              actionLabel={hasFilters ? "Effacer les filtres" : undefined}
              onAction={hasFilters ? clearFilters : undefined}
            />
          }
          ListFooterComponent={<View style={styles.footer} />}
        />
      )}
    </View>
  );
}
