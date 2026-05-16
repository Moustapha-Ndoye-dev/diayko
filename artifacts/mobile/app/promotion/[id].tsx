import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ItemCard } from "@/components/ItemCard";
import { EmptyState } from "@/components/EmptyState";
import { Item } from "@/types";

interface PromoConfig {
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  image: string;
  filter: (item: Item) => boolean;
}

const PROMOS: Record<string, PromoConfig> = {
  p1: {
    title: "Soldes Diayko",
    subtitle: "Jusqu'à -70% sur une sélection d'articles. Profitez-en avant qu'ils ne disparaissent.",
    tag: "SOLDES",
    tagColor: "#C84B1C",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
    filter: (item) => item.price < 15000,
  },
  p2: {
    title: "Coup de cœur",
    subtitle: "Une sélection mise en avant par notre équipe : qualité, style, valeur.",
    tag: "COUP DE CŒUR",
    tagColor: "#00853F",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&q=80",
    filter: (item) => item.likesCount > 5,
  },
  p3: {
    title: "Nouveautés",
    subtitle: "Les articles les plus récemment publiés sur Diayko.",
    tag: "NOUVEAUTÉS",
    tagColor: "#F5C518",
    image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200&q=80",
    filter: () => true,
  },
};

export default function PromotionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items } = useApp();

  const promo = PROMOS[id ?? ""] ?? PROMOS.p2!;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  const filtered = useMemo(() => items.filter(promo.filter), [items, promo]);

  const pairs: [Item, Item | undefined][] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    pairs.push([filtered[i]!, filtered[i + 1]]);
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    heroWrap: { height: 220, position: "relative" },
    heroImage: { ...StyleSheet.absoluteFillObject },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    backBtn: {
      position: "absolute", top: topPad + 8, left: 12,
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", zIndex: 2,
    },
    heroContent: { position: "absolute", left: 16, right: 16, bottom: 18, gap: 8 },
    tag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 3 },
    tagText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1.2 },
    heroTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.5 },
    heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.92)" },
    countRow: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    countText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    sortText: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.primary },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    grid: { padding: 12 },
    footer: { height: bottomPad },
  });

  return (
    <View style={styles.container}>
      <View style={styles.heroWrap}>
        <Image source={{ uri: promo.image }} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.7)"]} style={styles.heroOverlay} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
          <Feather name="chevron-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <View style={[styles.tag, { backgroundColor: promo.tagColor }]}>
            <Text style={styles.tagText}>{promo.tag}</Text>
          </View>
          <Text style={styles.heroTitle}>{promo.title}</Text>
          <Text style={styles.heroSub} numberOfLines={2}>{promo.subtitle}</Text>
        </View>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} articles</Text>
        <Text style={styles.sortText}>Trier · Recommandé</Text>
      </View>

      <FlatList
        data={pairs}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item: [left, right] }) => (
          <View style={styles.row}>
            <ItemCard item={left} />
            {right ? <ItemCard item={right} /> : <View style={{ flex: 1 }} />}
          </View>
        )}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="tag"
            title="Aucun article dans cette sélection"
            description="Revenez bientôt — la sélection est mise à jour quotidiennement."
          />
        }
        ListFooterComponent={<View style={styles.footer} />}
      />
    </View>
  );
}
