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
import { CATEGORIES, SIZES, CONDITIONS } from "@/data/mockData";
import { SellFormData } from "@/types";
import { SellerGate } from "@/components/SellerGate";

const COLORS_LIST = ["Black", "White", "Blue", "Red", "Green", "Yellow", "Brown", "Grey", "Multicolor", "Beige"];

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
        description: form.description.trim() || "No description provided.",
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
        description: form.description.trim() || "No description provided.",
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
    Alert.alert("Listed!", "Your item has been published successfully.");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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

  const serviceFee = form.price ? (parseFloat(form.price) * 0.08 + 0.7).toFixed(2) : null;
  const youEarn = form.price && serviceFee ? (parseFloat(form.price) - parseFloat(serviceFee)).toFixed(2) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sell an item</Text>
        <Text style={styles.subtitle}>Fill in the details to list your item</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.photoArea}>
          <Feather name="camera" size={32} color={colors.mutedForeground} />
          <Text style={styles.photoText}>Add photos</Text>
          <Text style={styles.photoSub}>Up to 20 photos</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} value={form.title} onChangeText={(v) => update("title", v)} placeholder="e.g. Blue denim jacket" placeholderTextColor={colors.mutedForeground} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Brand <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} value={form.brand} onChangeText={(v) => update("brand", v)} placeholder="e.g. Zara, Nike, H&M" placeholderTextColor={colors.mutedForeground} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textarea]} value={form.description} onChangeText={(v) => update("description", v)} placeholder="Describe the item, fit, any flaws…" placeholderTextColor={colors.mutedForeground} multiline />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
          <View style={styles.chipRow}>
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) =>
              chip(cat.id, form.category === cat.id, () => update("category", cat.id), cat.label)
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Size <Text style={styles.required}>*</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {SIZES.map((s) => chip(s, form.size === s, () => update("size", s)))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Condition <Text style={styles.required}>*</Text></Text>
          <View style={styles.chipRow}>
            {CONDITIONS.map((c) => chip(c, form.condition === c, () => update("condition", c)))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {COLORS_LIST.map((c) => chip(c, form.color === c, () => update("color", form.color === c ? "" : c)))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Price <Text style={styles.required}>*</Text></Text>
          <View style={styles.priceRow}>
            <Text style={styles.currencyLabel}>€</Text>
            <TextInput style={styles.priceInput} value={form.price} onChangeText={(v) => update("price", v.replace(/[^0-9.]/g, ""))} placeholder="0.00" placeholderTextColor={colors.mutedForeground} keyboardType="decimal-pad" />
          </View>
        </View>

        {youEarn && (
          <View style={styles.feeRow}>
            <Text style={styles.feeText}>Service fee: {serviceFee} €</Text>
            <Text style={styles.feeAmount}>You earn: {youEarn} €</Text>
          </View>
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={!isValid || submitting} activeOpacity={0.8}>
          <Text style={styles.submitText}>{submitting ? "Publishing…" : "List item"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
