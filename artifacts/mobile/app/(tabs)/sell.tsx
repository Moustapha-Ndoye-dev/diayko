import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp, toItem } from "@/context/AppContext";
import { api } from "@/lib/api";
import { CATEGORIES, SIZES, CONDITIONS, conditionLabel, sizeLabel } from "@/data/mockData";
import { SellFormData } from "@/types";
import { SellerGate } from "@/components/SellerGate";

const COLORS_LIST = ["Black", "White", "Blue", "Red", "Green", "Yellow", "Brown", "Grey", "Multicolor", "Beige"];
const COLOR_LABELS: Record<string, string> = {
  Black: "Noir",
  White: "Blanc",
  Blue: "Bleu",
  Red: "Rouge",
  Green: "Vert",
  Yellow: "Jaune",
  Brown: "Marron",
  Grey: "Gris",
  Multicolor: "Multicolore",
  Beige: "Beige",
};

export default function SellScreen() {
  const { sellerStatus } = useApp();

  // Gate: only approved sellers can access the listing form.
  if (sellerStatus !== "approved") {
    return <SellerGate />;
  }
  return <SellForm />;
}

function SellForm() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addListing, currentUser } = useApp();
  const [form, setForm] = useState<SellFormData>({
    title: "",
    description: "",
    brand: "",
    size: "",
    condition: "Good",
    category: "women",
    price: "",
    color: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof SellFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isValid =
    form.title.trim() &&
    form.brand.trim() &&
    form.size &&
    form.condition &&
    form.category &&
    form.price.trim() &&
    parseFloat(form.price) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const apiItem = await api.items.create({
        title: form.title.trim(),
        brand: form.brand.trim(),
        price: parseFloat(form.price),
        size: form.size,
        condition: form.condition,
        category: form.category,
        description: form.description.trim() || "Aucune description fournie.",
        color: form.color || null,
        sellerId: currentUser.id === "local-user" ? "00000000-0000-0000-0000-000000000000" : currentUser.id,
        images: [],
      });
      addListing(toItem(apiItem));
    } catch {
      // Fallback to local if API unavailable
      const { MOCK_USERS } = await import("@/data/mockData");
      addListing(toItem({
        id: Date.now().toString(),
        title: form.title.trim(),
        brand: form.brand.trim(),
        price: parseFloat(form.price),
        size: form.size,
        condition: form.condition as any,
        category: form.category,
        description: form.description.trim() || "Aucune description fournie.",
        color: form.color || null,
        sellerId: MOCK_USERS[0].id,
        likesCount: 0,
        viewsCount: 0,
        images: [],
        createdAt: new Date().toISOString(),
        seller: {
          id: MOCK_USERS[0].id,
          name: MOCK_USERS[0].name,
          rating: MOCK_USERS[0].rating,
          reviewCount: MOCK_USERS[0].reviewCount,
          itemCount: MOCK_USERS[0].itemCount,
          followersCount: MOCK_USERS[0].followersCount,
          followingCount: MOCK_USERS[0].followingCount,
          verified: MOCK_USERS[0].verified ?? false,
          createdAt: MOCK_USERS[0].joinedAt,
        },
      }));
    }
    setForm({ title: "", description: "", brand: "", size: "", condition: "Good", category: "women", price: "", color: "" });
    setSubmitting(false);
    Alert.alert("Publié !", "Votre article a été publié avec succès.");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 49;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 12,
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    content: { padding: 16, gap: 20 },
    photoArea: {
      borderWidth: 2, borderStyle: "dashed", borderColor: colors.border,
      borderRadius: colors.radius, height: 140, alignItems: "center",
      justifyContent: "center", backgroundColor: colors.muted, gap: 8,
    },
    photoText: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    photoSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    section: { gap: 6 },
    label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    required: { color: colors.primary },
    input: {
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: colors.radius, paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground,
    },
    textarea: { height: 90, textAlignVertical: "top" },
    priceRow: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border, borderRadius: colors.radius, overflow: "hidden",
    },
    currencyLabel: { paddingHorizontal: 14, fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    priceInput: { flex: 1, paddingVertical: 12, paddingRight: 14, fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1.5 },
    chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
    feeRow: { backgroundColor: colors.accent, borderRadius: colors.radius, padding: 12, gap: 4 },
    feeText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.primary },
    feeAmount: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.primary },
    submitBtn: {
      backgroundColor: colors.primary, borderRadius: colors.radius,
      paddingVertical: 16, alignItems: "center",
      marginBottom: bottomPad + 16, opacity: isValid && !submitting ? 1 : 0.5,
    },
    submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  });

  const chip = (val: string, selected: boolean, onPress: () => void, label?: string) => (
    <TouchableOpacity
      key={val}
      style={[styles.chip, {
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.accent : colors.card,
      }]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: selected ? colors.primary : colors.foreground }]}>
        {label ?? val}
      </Text>
    </TouchableOpacity>
  );

  const rawPrice = form.price ? parseFloat(form.price) : null;
  const serviceFeeAmt = rawPrice ? Math.max(500, Math.round(rawPrice * 0.08) + 500) : null;
  const youEarn = rawPrice && serviceFeeAmt ? rawPrice - serviceFeeAmt : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Publier un article</Text>
        <Text style={styles.subtitle}>Remplissez les détails pour mettre en vente</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.photoArea}>
          <Feather name="camera" size={32} color={colors.mutedForeground} />
          <Text style={styles.photoText}>Ajouter des photos</Text>
          <Text style={styles.photoSub}>Jusqu'à 20 photos</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.label}>Titre <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} value={form.title} onChangeText={(v) => update("title", v)} placeholder="ex. Veste en jean bleu" placeholderTextColor={colors.mutedForeground} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Marque <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} value={form.brand} onChangeText={(v) => update("brand", v)} placeholder="ex. Zara, Nike, H&M, Artisan local" placeholderTextColor={colors.mutedForeground} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textarea]} value={form.description} onChangeText={(v) => update("description", v)} placeholder="Décrivez l'article, la coupe, les éventuels défauts…" placeholderTextColor={colors.mutedForeground} multiline />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Catégorie <Text style={styles.required}>*</Text></Text>
          <View style={styles.chipRow}>
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) =>
              chip(cat.id, form.category === cat.id, () => update("category", cat.id), cat.label)
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Taille <Text style={styles.required}>*</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {SIZES.map((s) => chip(sizeLabel(s), form.size === s, () => update("size", s)))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>État <Text style={styles.required}>*</Text></Text>
          <View style={styles.chipRow}>
            {CONDITIONS.map((c) => chip(conditionLabel(c), form.condition === c, () => update("condition", c)))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Couleur</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {COLORS_LIST.map((c) => chip(c, form.color === c, () => update("color", form.color === c ? "" : c), COLOR_LABELS[c] ?? c))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Prix <Text style={styles.required}>*</Text></Text>
          <View style={styles.priceRow}>
            <Text style={styles.currencyLabel}>F</Text>
            <TextInput style={styles.priceInput} value={form.price} onChangeText={(v) => update("price", v.replace(/[^0-9]/g, ""))} placeholder="5000" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" />
            <Text style={[styles.currencyLabel, { paddingLeft: 0 }]}>CFA</Text>
          </View>
        </View>

        {youEarn != null && serviceFeeAmt != null && (
          <View style={styles.feeRow}>
            <Text style={styles.feeText}>Commission Diayko : {serviceFeeAmt} FCFA (8% + 500 FCFA fixe)</Text>
            <Text style={styles.feeAmount}>Vous recevez : {youEarn} FCFA</Text>
          </View>
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={!isValid || submitting} activeOpacity={0.8}>
          <Text style={styles.submitText}>{submitting ? "Publication…" : "Publier l'article"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
