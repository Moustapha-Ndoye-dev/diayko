import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useDebounce } from "@/hooks/useDebounce";
import { ItemCard } from "@/components/ItemCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { CONDITIONS, SIZES, conditionLabel, sizeLabel } from "@/data/mockData";
import { api } from "@/lib/api";
import { fcfa } from "@/lib/currency";
import { toItem } from "@/context/AppContext";
import type { Condition, Item } from "@/types";

const POPULAR_SEARCHES = ["Nike", "Zara", "Veste", "Robe wax", "Baskets", "Sac", "Levi's"];

type Sort = "newest" | "price_asc";

type Filters = {
  size: string | null;
  condition: Condition | null;
  minPrice: string;
  maxPrice: string;
  sort: Sort;
};

const INITIAL_FILTERS: Filters = {
  size: null,
  condition: null,
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 64;

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const priceMin = filters.minPrice ? Number(filters.minPrice) : undefined;
  const priceMax = filters.maxPrice ? Number(filters.maxPrice) : undefined;

  const hasFilters =
    filters.size !== null ||
    filters.condition !== null ||
    filters.minPrice.trim() !== "" ||
    filters.maxPrice.trim() !== "" ||
    filters.sort !== "newest";
  const isSearching = debouncedQuery.trim().length > 0 || hasFilters;

  const fetchPage = useCallback(
    async (nextPage: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await api.items.list({
          q: debouncedQuery.trim() || undefined,
          size: filters.size ?? undefined,
          condition: filters.condition ?? undefined,
          minPrice: priceMin,
          maxPrice: priceMax,
          sort: filters.sort,
          page: nextPage,
          limit: 20,
        });
        const nextItems = res.items.map(toItem);
        setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
        setPage(res.page);
        setHasMore(res.hasMore);
      } catch {
        setError("Recherche indisponible. Verifiez votre connexion.");
        if (!append) setItems([]);
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [debouncedQuery, filters, priceMin, priceMax],
  );

  useEffect(() => {
    if (isSearching) {
      fetchPage(1);
    } else {
      setItems([]);
      setHasMore(false);
      setError(null);
    }
  }, [fetchPage, isSearching]);

  const pairs = useMemo(() => {
    const result: [Item, Item | undefined][] = [];
    for (let i = 0; i < items.length; i += 2) {
      result.push([items[i]!, items[i + 1]]);
    }
    return result;
  }, [items]);

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
    setFilters(INITIAL_FILTERS);
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchPage(page + 1, true);
  }, [fetchPage, hasMore, loading, loadingMore, page]);

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
      gap: 12,
    },
    filterGroup: { gap: 8 },
    filterLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
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
    priceRow: { flexDirection: "row", gap: 8 },
    priceInput: {
      flex: 1,
      backgroundColor: colors.secondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 9,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    clearBtn: { alignSelf: "flex-start" },
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
    footer: { minHeight: bottomPad + 16, alignItems: "center", justifyContent: "center" },
  });

  const chip = (label: string, selected: boolean, onPress: () => void) => (
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

  const renderFilters = () => (
    <View style={styles.filtersPanel}>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Tri</Text>
        <View style={styles.chipRow}>
          {chip("Nouveautes", filters.sort === "newest", () =>
            setFilters((prev) => ({ ...prev, sort: "newest" })),
          )}
          {chip("Prix croissant", filters.sort === "price_asc", () =>
            setFilters((prev) => ({ ...prev, sort: "price_asc" })),
          )}
        </View>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Prix</Text>
        <View style={styles.priceRow}>
          <TextInput
            style={styles.priceInput}
            value={filters.minPrice}
            onChangeText={(value) =>
              setFilters((prev) => ({ ...prev, minPrice: value.replace(/[^0-9]/g, "") }))
            }
            placeholder={fcfa(5000)}
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.priceInput}
            value={filters.maxPrice}
            onChangeText={(value) =>
              setFilters((prev) => ({ ...prev, maxPrice: value.replace(/[^0-9]/g, "") }))
            }
            placeholder={fcfa(50000)}
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
          />
        </View>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Taille</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {SIZES.map((s) => chip(sizeLabel(s), filters.size === s, () => setSize(s)))}
          </View>
        </ScrollView>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Etat</Text>
        <View style={styles.chipRow}>
          {CONDITIONS.map((c) =>
            chip(conditionLabel(c), filters.condition === c, () => setCondition(c)),
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
          </TouchableOpacity>
        </View>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher articles, marques..."
        />
      </View>

      {showFilters && renderFilters()}

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
      ) : loading ? (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={pairs}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item: [left, right] }) => (
            <View style={styles.row}>
              <ItemCard item={left} />
              {right ? <ItemCard item={right} /> : <View style={{ flex: 1 }} />}
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {items.length} resultat{items.length > 1 ? "s" : ""}
              </Text>
            </View>
          }
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <EmptyState
              icon={error ? "wifi-off" : "search"}
              title={error ?? "Aucun resultat"}
              description={
                error
                  ? "La recherche API n'a pas repondu."
                  : "Essayez un autre terme ou ajustez les filtres."
              }
              actionLabel={hasFilters ? "Effacer les filtres" : undefined}
              onAction={hasFilters ? clearFilters : undefined}
            />
          }
          ListFooterComponent={
            <View style={styles.footer}>
              {loadingMore ? <ActivityIndicator size="small" color={colors.primary} /> : null}
            </View>
          }
        />
      )}
    </View>
  );
}
