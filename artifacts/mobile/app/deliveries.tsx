import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { fcfa } from "@/lib/currency";
import { api, ApiOrderDetail } from "@/lib/api";
import { useApp } from "@/context/AppContext";

function formatEventDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function DeliveriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentUser } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [deliveries, setDeliveries] = useState<ApiOrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      // Fetch active orders (processing + in_transit), then load detail for events.
      const [proc, inTransit] = await Promise.all([
        api.orders.list({ userId: currentUser.id, role: "buyer", status: "processing" }),
        api.orders.list({ userId: currentUser.id, role: "buyer", status: "in_transit" }),
      ]);
      const summaries = [...inTransit.orders, ...proc.orders];
      const details = await Promise.all(summaries.map((o) => api.orders.get(o.id)));
      setDeliveries(details);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    load();
  }, [load]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingTop: topPad + 8, paddingBottom: 12, paddingHorizontal: 12,
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10,
    },
    backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
    title: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground },
    card: {
      backgroundColor: colors.card, marginHorizontal: 12, marginTop: 12,
      borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 12,
    },
    topRow: { flexDirection: "row", gap: 12 },
    image: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.accent },
    info: { flex: 1, gap: 2 },
    itemTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    meta: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    price: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.primary, marginTop: 2 },
    etaPill: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: 8, alignSelf: "flex-start",
    },
    etaText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primary },
    timeline: { gap: 0, paddingLeft: 4 },
    step: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
    dotCol: { alignItems: "center", width: 18 },
    dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
    line: { width: 2, flex: 1, marginTop: 2 },
    stepInfo: { flex: 1, paddingBottom: 14 },
    stepLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    stepDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    footer: { height: bottomPad + 16 },
    empty: { padding: 32, alignItems: "center", gap: 6 },
    emptyTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 8 },
    emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
    errorText: { fontSize: 13, color: colors.destructive, textAlign: "center" },
    retryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
    retryText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
  });

  const renderItem = ({ item }: { item: ApiOrderDetail }) => {
    const image = item.item.images[0];
    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={styles.image} />}
          <View style={styles.info}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.item.title}</Text>
            <Text style={styles.meta}>
              {item.carrier ?? "Livraison"} · #{item.trackingId ?? item.id.slice(0, 8)}
            </Text>
            <Text style={styles.price}>{fcfa(item.totalPrice)}</Text>
          </View>
        </View>
        {item.eta && (
          <View style={styles.etaPill}>
            <Feather name="clock" size={13} color={colors.primary} />
            <Text style={styles.etaText}>Livraison estimée : {item.eta}</Text>
          </View>
        )}
        <View style={styles.timeline}>
          {item.events.map((step, i) => {
            const isLast = i === item.events.length - 1;
            return (
              <View key={step.id} style={styles.step}>
                <View style={styles.dotCol}>
                  <View style={[styles.dot, { backgroundColor: step.done ? colors.primary : colors.border }]} />
                  {!isLast && (
                    <View style={[styles.line, { backgroundColor: step.done ? colors.primary : colors.border }]} />
                  )}
                </View>
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepLabel, { color: step.done ? colors.foreground : colors.mutedForeground }]}>
                    {step.label}
                  </Text>
                  <Text style={styles.stepDate}>{formatEventDate(step.occurredAt)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const Header = (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
        <Feather name="chevron-left" size={24} color={colors.foreground} />
      </TouchableOpacity>
      <Text style={styles.title}>Mes livraisons</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {Header}
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error && deliveries.length === 0) {
    return (
      <View style={styles.container}>
        {Header}
        <View style={styles.center}>
          <Feather name="alert-circle" size={28} color={colors.destructive} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Header}
      <FlatList
        data={deliveries}
        keyExtractor={(d) => d.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="truck" size={40} color={colors.mutedForeground} />
            <Text style={styles.emptyTitle}>Aucune livraison en cours</Text>
            <Text style={styles.emptyDesc}>Vos commandes en transit apparaîtront ici avec leur suivi détaillé.</Text>
          </View>
        }
        ListFooterComponent={<View style={styles.footer} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
