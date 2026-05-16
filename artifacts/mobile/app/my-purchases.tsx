import React from "react";
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
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { fcfa } from "@/lib/currency";

type OrderStatus = "delivered" | "in_transit" | "processing" | "cancelled";

interface Order {
  id: string;
  itemTitle: string;
  itemBrand: string;
  price: number;
  imageUri: string;
  status: OrderStatus;
  date: string;
  deliveryMethod: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  delivered: { label: "Livré", color: "#00853F", icon: "check-circle" },
  in_transit: { label: "En cours", color: "#F5C518", icon: "truck" },
  processing: { label: "En traitement", color: "#009CDE", icon: "clock" },
  cancelled: { label: "Annulé", color: "#C84B1C", icon: "x-circle" },
};

const MOCK_ORDERS: Order[] = [
  {
    id: "o1",
    itemTitle: "Robe wax ankara multicolore",
    itemBrand: "Artisan local",
    price: 18000,
    imageUri: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=200&q=60",
    status: "delivered",
    date: "14 mai 2026",
    deliveryMethod: "Wave",
  },
  {
    id: "o2",
    itemTitle: "Jean slim délavé homme",
    itemBrand: "Zara",
    price: 12500,
    imageUri: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&q=60",
    status: "in_transit",
    date: "16 mai 2026",
    deliveryMethod: "Orange Money",
  },
  {
    id: "o3",
    itemTitle: "Sneakers blanches cuir",
    itemBrand: "Nike",
    price: 25000,
    imageUri: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=60",
    status: "processing",
    date: "17 mai 2026",
    deliveryMethod: "Free Money",
  },
];

export default function MyPurchasesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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
    orderTop: {
      flexDirection: "row",
      padding: 14,
      gap: 12,
      alignItems: "flex-start",
    },
    orderImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: colors.muted },
    orderInfo: { flex: 1, gap: 4 },
    orderBrand: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    orderTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, lineHeight: 20 },
    orderPrice: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.primary },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    orderFooter: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.separator,
      gap: 8,
    },
    orderDate: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    orderBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    orderBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
    emptyIcon: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
      marginBottom: 4,
    },
    emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, textAlign: "center" },
    emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", lineHeight: 21 },
  });

  if (MOCK_ORDERS.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes achats</Text>
        </View>
        <View style={styles.emptyContainer}>
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes achats</Text>
      </View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(o) => o.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
        renderItem={({ item: order }) => {
          const cfg = STATUS_CONFIG[order.status];
          return (
            <View style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Image source={{ uri: order.imageUri }} style={styles.orderImage} resizeMode="cover" />
                <View style={styles.orderInfo}>
                  <Text style={styles.orderBrand}>{order.itemBrand}</Text>
                  <Text style={styles.orderTitle} numberOfLines={2}>{order.itemTitle}</Text>
                  <Text style={styles.orderPrice}>{fcfa(order.price)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.color + "1A" }]}>
                    <Feather name={cfg.icon as any} size={12} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderDate}>
                  {order.date} · {order.deliveryMethod}
                </Text>
                <TouchableOpacity
                  style={styles.orderBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Voir les détails"
                >
                  <Text style={styles.orderBtnText}>Détails</Text>
                </TouchableOpacity>
                {order.status === "delivered" && (
                  <TouchableOpacity
                    style={[styles.orderBtn, { borderColor: colors.primary }]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Racheter"
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
