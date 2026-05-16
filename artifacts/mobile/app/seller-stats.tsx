import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { fcfa } from "@/lib/currency";

interface Metric { label: string; value: string; trend?: string; trendUp?: boolean; icon: string }
interface TopItem { title: string; views: number; sold: boolean; revenue: number }

const METRICS: Metric[] = [
  { label: "Ventes ce mois", value: "12", trend: "+4 vs mois dernier", trendUp: true, icon: "shopping-bag" },
  { label: "Revenus", value: fcfa(186000), trend: "+12%", trendUp: true, icon: "trending-up" },
  { label: "Vues totales", value: "1 248", trend: "+23%", trendUp: true, icon: "eye" },
  { label: "Taux de conversion", value: "4.8%", trend: "-0.6%", trendUp: false, icon: "target" },
];

const TOP_ITEMS: TopItem[] = [
  { title: "Robe wax ankara multicolore", views: 248, sold: true, revenue: 18000 },
  { title: "Sneakers blanches cuir", views: 198, sold: true, revenue: 25000 },
  { title: "Sac à main artisanal", views: 156, sold: false, revenue: 0 },
  { title: "Chemise wax homme", views: 132, sold: true, revenue: 14000 },
];

const WEEKLY = [3, 5, 4, 7, 6, 9, 12];

export default function SellerStatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const maxWeekly = Math.max(...WEEKLY);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingTop: topPad + 8, paddingBottom: 12, paddingHorizontal: 12,
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10,
    },
    backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
    title: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground },
    badge: {
      backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 3,
      borderRadius: 4, marginRight: 4,
    },
    badgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },
    metricsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 12 },
    metricCard: {
      width: "47%", flexGrow: 1,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 14, gap: 6,
    },
    metricIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    metricLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5 },
    metricValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.4 },
    trendRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    trendText: { fontSize: 11, fontFamily: "Inter_500Medium" },
    section: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
    sectionTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground },
    chartCard: {
      marginHorizontal: 12, padding: 16, backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    },
    chartRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 110, gap: 8 },
    bar: { flex: 1, borderRadius: 6, backgroundColor: colors.primary },
    chartLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
    chartLabel: { flex: 1, fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textAlign: "center" },
    itemRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    rank: {
      width: 26, height: 26, borderRadius: 13,
      backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
    },
    rankText: { fontSize: 12, fontFamily: "Inter_700Bold", color: colors.primary },
    itemInfo: { flex: 1, gap: 2 },
    itemTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    itemMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    itemRevenue: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary },
    listCard: { marginHorizontal: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: "hidden" },
    footer: { height: bottomPad + 24 },
  });

  const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Statistiques vendeur</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>BÊTA</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          {METRICS.map((m) => (
            <View key={m.label} style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Feather name={m.icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricValue}>{m.value}</Text>
              {m.trend && (
                <View style={styles.trendRow}>
                  <Feather
                    name={m.trendUp ? "arrow-up-right" : "arrow-down-right"}
                    size={11}
                    color={m.trendUp ? "#00853F" : "#C84B1C"}
                  />
                  <Text style={[styles.trendText, { color: m.trendUp ? "#00853F" : "#C84B1C" }]}>{m.trend}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}><Text style={styles.sectionTitle}>Ventes des 7 derniers jours</Text></View>
        <View style={styles.chartCard}>
          <View style={styles.chartRow}>
            {WEEKLY.map((v, i) => (
              <View key={i} style={[styles.bar, { height: `${(v / maxWeekly) * 100}%`, opacity: 0.45 + (i / WEEKLY.length) * 0.55 }]} />
            ))}
          </View>
          <View style={styles.chartLabels}>
            {DAYS.map((d, i) => <Text key={i} style={styles.chartLabel}>{d}</Text>)}
          </View>
        </View>

        <View style={styles.section}><Text style={styles.sectionTitle}>Top articles</Text></View>
        <View style={styles.listCard}>
          {TOP_ITEMS.map((item, i) => (
            <View key={i} style={[styles.itemRow, i === TOP_ITEMS.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.rank}><Text style={styles.rankText}>{i + 1}</Text></View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemMeta}>{item.views} vues · {item.sold ? "Vendu" : "En ligne"}</Text>
              </View>
              <Text style={styles.itemRevenue}>{item.sold ? fcfa(item.revenue) : "—"}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}
