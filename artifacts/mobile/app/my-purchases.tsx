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
import { api, ApiOrder, ApiOrderStatus, ApiPaymentMethod } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const STATUS_CONFIG: Record<ApiOrderStatus, { label: string; color: string; icon: string }> = {
  delivered: { label: "Livré", color: "#00853F", icon: "check-circle" },
  in_transit: { label: "En cours", color: "#F5C518", icon: "truck" },
  processing: { label: "En traitement", color: "#009CDE", icon: "clock" },
  cancelled: { label: "Annulé", color: "#C84B1C", icon: "x-circle" },
};

const PAYMENT_LABEL: Record<ApiPaymentMethod, string> = {
  wave: "Wave",
  orange_money: "Orange Money",
  free_money: "Free Money",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export default function MyPurchasesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentUser } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await api.orders.list({ userId: currentUser.id, role: "buyer" });
      setOrders(res.orders);
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
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground },
    orderCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    orderTop: { flexDirection: "row", padding: 14, gap: 12, alignItems: "flex-start" },
    orderImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: colors.muted },
    orderInfo: { flex: 1, gap: 4 },
    orderBrand: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    orderTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, lineHeight: 20 },
    orderPrice: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.primary },
    statusBadge: {
      flexDirection: "row", alignItems: "center", gap: 4,
      alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    },
    statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    orderFooter: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 14, paddingVertical: 10,
      borderTopWidth: 1, borderTopColor: colors.separator, gap: 8,
    },
    orderDate: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    orderBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
    orderBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
    emptyIcon: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", marginBottom: 4,
    },
    emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, textAlign: "center" },
    emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", lineHeight: 21 },
    errorText: { fontSize: 13, color: colors.destructive, textAlign: "center" },
  });

  const Header = (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Retour">
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Mes achats</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {Header}
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.container}>
        {Header}
        <View style={styles.centerContainer}>
          <Feather name="alert-circle" size={28} color={colors.destructive} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.orderBtn} onPress={load}>
            <Text style={styles.orderBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        {Header}
        <View style={styles.centerContainer}>
          <View style={styles.emptyIcon}>
            <Feather name="shopping-bag" size={28} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Aucun achat pour l'instant</Text>
          <Text style={styles.emptySub}>Parcourez les articles et faites votre premier achat sécurisé.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Header}
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
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
        renderItem={({ item: order }) => {
          const cfg = STATUS_CONFIG[order.status];
          const image = order.item.images[0];
          return (
            <View style={styles.orderCard}>
              <View style={styles.orderTop}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.orderImage} resizeMode="cover" />
                ) : (
                  <View style={styles.orderImage} />
                )}
                <View style={styles.orderInfo}>
                  <Text style={styles.orderBrand}>{order.item.brand}</Text>
                  <Text style={styles.orderTitle} numberOfLines={2}>{order.item.title}</Text>
                  <Text style={styles.orderPrice}>{fcfa(order.totalPrice)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.color + "1A" }]}>
                    <Feather name={cfg.icon as never} size={12} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderDate}>
                  {formatDate(order.createdAt)} · {PAYMENT_LABEL[order.paymentMethod]}
                </Text>
                <TouchableOpacity
                  style={styles.orderBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Voir les détails"
                  onPress={() =>
                    router.push({
                      pathname: "/conversation/[id]",
                      params: {
                        id: `platform-order-${order.id}`,
                        itemTitle: order.item.title,
                        itemPrice: String(order.totalPrice),
                        itemImage: image ?? "",
                        initialMessage: `📦 Commande #${order.trackingId ?? order.id.slice(0, 8)} — ${order.item.title}. Statut : ${cfg.label}.`,
                      },
                    })
                  }
                >
                  <Text style={styles.orderBtnText}>Détails</Text>
                </TouchableOpacity>
                {order.status === "delivered" && (
                  <TouchableOpacity
                    style={[styles.orderBtn, { borderColor: colors.primary }]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Racheter"
                    onPress={() => router.push("/(tabs)/search")}
                  >
                    <Text style={[styles.orderBtnText, { color: colors.primary }]}>Racheter</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
