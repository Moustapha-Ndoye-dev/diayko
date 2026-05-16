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
import { useApp } from "@/context/AppContext";
import { CATEGORIES, SIZES, CONDITIONS } from "@/data/mockData";
import { Item, SellFormData } from "@/types";

const COLORS_LIST = ["Black", "White", "Blue", "Red", "Green", "Yellow", "Brown", "Grey", "Multicolor", "Beige"];

export default function SellScreen() {
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
    await new Promise((r) => setTimeout(r, 800));
    const newItem: Item = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: form.title.trim(),
      brand: form.brand.trim(),
      price: parseFloat(form.price),
      size: form.size,
      condition: form.condition,
      category: form.category,
      images: [require("../../assets/images/item1.png")],
      description: form.description.trim() || "No description provided.",
      seller: currentUser,
      likes: 0,
      views: 0,
      postedAt: new Date().toISOString().split("T")[0],
      color: form.color || undefined,
    };
    addListing(newItem);
    setForm({
      title: "",
      description: "",
      brand: "",
      size: "",
      condition: "Good",
      category: "women",
      price: "",
      color: "",
    });
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
    title: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    content: { padding: 16, gap: 20 },
    photoArea: {
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: colors.radius,
      height: 140,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.muted,
      gap: 8,
    },
    photoText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    photoSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    section: { gap: 6 },
    label: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    required: { color: colors.primary },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    textarea: {
      height: 90,
      textAlignVertical: "top",
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      overflow: "hidden",
    },
    currencyLabel: {
      paddingHorizontal: 14,
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    priceInput: {
      flex: 1,
      paddingVertical: 12,
      paddingRight: 14,
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1.5,
    },
    chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
    feeRow: {
      backgroundColor: colors.accent,
      borderRadius: colors.radius,
      padding: 12,
      gap: 4,
    },
    feeText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.primary,
    },
    feeAmount: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: bottomPad + 16,
      opacity: isValid && !submitting ? 1 : 0.5,
    },
    submitText: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
  });

  const serviceFee = form.price ? (parseFloat(form.price) * 0.08 + 0.7).toFixed(2) : null;
  const youEarn = form.price && serviceFee
    ? (parseFloat(form.price) - parseFloat(serviceFee)).toFixed(2)
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sell an item</Text>
        <Text style={styles.subtitle}>Fill in the details to list your item</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.photoArea}>
          <Feather name="camera" size={32} color={colors.mutedForeground} />
          <Text style={styles.photoText}>Add photos</Text>
          <Text style={styles.photoSub}>Up to 20 photos</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(v) => update("title", v)}
            placeholder="e.g. Blue denim jacket"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Brand <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={form.brand}
            onChangeText={(v) => update("brand", v)}
            placeholder="e.g. Zara, Nike, H&M"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.description}
            onChangeText={(v) => update("description", v)}
            placeholder="Describe the item, fit, any flaws…"
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
          <View style={styles.chipRow}>
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  {
                    borderColor: form.category === cat.id ? colors.primary : colors.border,
                    backgroundColor: form.category === cat.id ? colors.accent : colors.card,
                  },
                ]}
                onPress={() => update("category", cat.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: form.category === cat.id ? colors.primary : colors.foreground },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Size <Text style={styles.required}>*</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.chip,
                    {
                      borderColor: form.size === s ? colors.primary : colors.border,
                      backgroundColor: form.size === s ? colors.accent : colors.card,
                    },
                  ]}
                  onPress={() => update("size", s)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: form.size === s ? colors.primary : colors.foreground },
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Condition <Text style={styles.required}>*</Text></Text>
          <View style={styles.chipRow}>
            {CONDITIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.chip,
                  {
                    borderColor: form.condition === c ? colors.primary : colors.border,
                    backgroundColor: form.condition === c ? colors.accent : colors.card,
                  },
                ]}
                onPress={() => update("condition", c)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: form.condition === c ? colors.primary : colors.foreground },
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {COLORS_LIST.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    {
                      borderColor: form.color === c ? colors.primary : colors.border,
                      backgroundColor: form.color === c ? colors.accent : colors.card,
                    },
                  ]}
                  onPress={() => update("color", form.color === c ? "" : c)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: form.color === c ? colors.primary : colors.foreground },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Price <Text style={styles.required}>*</Text></Text>
          <View style={styles.priceRow}>
            <Text style={styles.currencyLabel}>€</Text>
            <TextInput
              style={styles.priceInput}
              value={form.price}
              onChangeText={(v) => update("price", v.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {youEarn && (
          <View style={styles.feeRow}>
            <Text style={styles.feeText}>Service fee: {serviceFee} €</Text>
            <Text style={styles.feeAmount}>You earn: {youEarn} €</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={!isValid || submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>
            {submitting ? "Publishing…" : "List item"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
