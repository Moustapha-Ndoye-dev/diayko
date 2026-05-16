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

type Step = { label: string; date: string; done: boolean };

interface Delivery {
  id: string;
  itemTitle: string;
  imageUri: string;
  price: number;
  trackingId: string;
  carrier: "Wave Express" | "DHL Sénégal" | "Sahel Logistique";
  eta: string;
  steps: Step[];
}

const MOCK_DELIVERIES: Delivery[] = [
  {
    id: "d1",
    itemTitle: "Jean slim délavé homme",
    imageUri: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&q=60",
    price: 12500,
    trackingId: "DK-2026-08412",
    carrier: "Wave Express",
    eta: "Demain · 14h-17h",
    steps: [
      { label: "Commande confirmée", date: "16 mai · 09:42", done: true },
      { label: "Prise en charge par le vendeur", date: "16 mai · 14:18", done: true },
      { label: "En transit vers Dakar", date: "17 mai · 08:00", done: true },
      { label: "En cours de livraison", date: "Aujourd'hui", done: false },
      { label: "Livré", date: "—", done: false },
    ],
  },
  {
    id: "d2",
    itemTitle: "Sneakers blanches cuir",
    imageUri: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=60",
    price: 25000,
    trackingId: "DK-2026-08398",
    carrier: "DHL Sénégal",
    eta: "19 mai · matinée",
    steps: [
      { label: "Commande confirmée", date: "15 mai · 18:22", done: true },
      { label: "Prise en charge par le vendeur", date: "16 mai · 10:00", done: true },
      { label: "En transit", date: "17 mai", done: false },
      { label: "En cours de livraison", date: "—", done: false },
      { label: "Livré", date: "—", done: false },
    ],
  },
];

export default function DeliveriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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
  });

  const renderItem = ({ item }: { item: Delivery }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image source={{ uri: item.imageUri }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.itemTitle}</Text>
          <Text style={styles.meta}>{item.carrier} · #{item.trackingId}</Text>
          <Text style={styles.price}>{fcfa(item.price)}</Text>
        </View>
      </View>
      <View style={styles.etaPill}>
        <Feather name="clock" size={13} color={colors.primary} />
        <Text style={styles.etaText}>Livraison estimée : {item.eta}</Text>
      </View>
      <View style={styles.timeline}>
        {item.steps.map((step, i) => {
          const isLast = i === item.steps.length - 1;
          return (
            <View key={i} style={styles.step}>
              <View style={styles.dotCol}>
                <View style={[styles.dot, { backgroundColor: step.done ? colors.primary : colors.border }]} />
                {!isLast && <View style={[styles.line, { backgroundColor: step.done ? colors.primary : colors.border }]} />}
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepLabel, { color: step.done ? colors.foreground : colors.mutedForeground }]}>
                  {step.label}
                </Text>
                <Text style={styles.stepDate}>{step.date}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Mes livraisons</Text>
      </View>
      <FlatList
        data={MOCK_DELIVERIES}
        keyExtractor={(d) => d.id}
        renderItem={renderItem}
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
