import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { api, type ApiOrder, type ApiSellerStats } from "@/lib/api";
import { fcfa } from "@/lib/currency";

type Metric = {
  label: string;
  value: string;
  icon: string;
};

export default function SellerStatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [stats, setStats] = useState<ApiSellerStats | null>(null);
  const [sales, setSales] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [statsRes, salesRes] = await Promise.all([
        api.seller.stats(),
        api.seller.sales(),
      ]);
      setStats(statsRes);
      setSales(salesRes.orders);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const revenue = useMemo(
    () =>
      sales
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => sum + Number(order.totalPrice), 0),
    [sales],
  );

  const metrics: Metric[] = [
    { label: "Ventes", value: String(sales.length), icon: "shopping-bag" },
    { label: "Revenus livres", value: fcfa(revenue), icon: "trending-up" },
    { label: "Vues totales", value: String(stats?.views ?? 0), icon: "eye" },
    { label: "Favoris", value: String(stats?.likes ?? 0), icon: "heart" },
  ];

  const topItems = useMemo(() => sales.slice(0, 4), [sales]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: topPad + 8,
      paddingBottom: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    badge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      marginRight: 4,
    },
    badgeText: {
      fontSize: 9,
      fontFamily: "Inter_700Bold",
      color: "#fff",
      letterSpacing: 1,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: 28,
    },
    centerTitle: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
    },
    centerText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    retryBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    retryText: { color: "#fff", fontFamily: "Inter_600SemiBold" },
    metricsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 12 },
    metricCard: {
      width: "47%",
      flexGrow: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      gap: 6,
    },
    metricIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    metricLabel: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    metricValue: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    section: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    chartCard: {
      marginHorizontal: 12,
      padding: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
    },
    chartRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: 110,
      gap: 8,
    },
    bar: { flex: 1, borderRadius: 6, backgroundColor: colors.primary },
    chartLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
    chartLabel: {
      flex: 1,
      fontSize: 10,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rank: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    rankText: { fontSize: 12, fontFamily: "Inter_700Bold", color: colors.primary },
    itemInfo: { flex: 1, gap: 2 },
    itemTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    itemMeta: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    itemRevenue: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary },
    listCard: {
      marginHorizontal: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: "hidden",
    },
    emptyList: {
      padding: 18,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    footer: { height: bottomPad + 24 },
  });

  const weekly = [sales.length, stats?.views ?? 0, stats?.likes ?? 0, revenue / 1000].map((n) =>
    Math.max(0, Math.round(n)),
  );
  const maxWeekly = Math.max(...weekly, 1);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.title}>Statistiques vendeur</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.title}>Statistiques vendeur</Text>
        </View>
        <View style={styles.center}>
          <Feather name="wifi-off" size={44} color={colors.border} />
          <Text style={styles.centerTitle}>Stats indisponibles</Text>
          <Text style={styles.centerText}>Impossible de synchroniser avec l'API.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadStats}>
            <Text style={styles.retryText}>Reessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Statistiques vendeur</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>API</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          {metrics.map((m) => (
            <View key={m.label} style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Feather name={m.icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricValue}>{m.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activite API</Text>
        </View>
        <View style={styles.chartCard}>
          <View style={styles.chartRow}>
            {weekly.map((v, i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(8, (v / maxWeekly) * 100)}%`,
                    opacity: 0.45 + (i / weekly.length) * 0.55,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.chartLabels}>
            {["Ventes", "Vues", "Favoris", "K FCFA"].map((label) => (
              <Text key={label} style={styles.chartLabel}>
                {label}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique ventes</Text>
        </View>
        <View style={styles.listCard}>
          {topItems.length === 0 ? (
            <Text style={styles.emptyList}>Aucune vente pour le moment.</Text>
          ) : (
            topItems.map((order, i) => (
              <View
                key={order.id}
                style={[styles.itemRow, i === topItems.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={styles.rank}>
                  <Text style={styles.rankText}>{i + 1}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {order.item.title}
                  </Text>
                  <Text style={styles.itemMeta}>{order.status}</Text>
                </View>
                <Text style={styles.itemRevenue}>{fcfa(order.totalPrice)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}
