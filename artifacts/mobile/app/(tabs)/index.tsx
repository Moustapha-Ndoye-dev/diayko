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
      paddingBottom: 10,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    logo: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      flex: 1,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    categoryBar: {
      marginTop: 6,
    },
    grid: {
      padding: 12,
      gap: 12,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    seeAll: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
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
      height: Platform.OS === "web" ? 34 : 0,
    },
  });

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Text style={styles.logo}>vinted</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="bell" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <SearchBar
          value=""
          onChangeText={() => {}}
          onPress={() => router.push("/(tabs)/search")}
          editable={false}
        />
        <View style={styles.categoryBar}>
          <CategoryBar
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "all" ? "New arrivals" : CATEGORIES.find(c => c.id === selectedCategory)?.label}
        </Text>
        <Text style={styles.seeAll}>{filtered.length} items</Text>
      </View>
    </View>
  );

  const renderPair = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.row}>
      <ItemCard item={item[0]} />
      {item[1] ? <ItemCard item={item[1]} /> : <View style={{ flex: 1 }} />}
    </View>
  );

  const pairs = useMemo(() => {
    const result = [];
    for (let i = 0; i < filtered.length; i += 2) {
      result.push([filtered[i], filtered[i + 1]]);
    }
    return result;
  }, [filtered]);

  return (
    <View style={styles.container}>
      <FlatList
        data={pairs}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderPair}
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
