/**
 * Checkout screen — FCFA · Senegalese payment methods.
 * Route: /checkout/[id]   params: id (item id), itemTitle, itemPrice, itemImage
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { fcfa, serviceFee } from "@/lib/currency";

type PaymentMethod = "wave" | "orange_money" | "free_money" | "cash";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  sublabel: string;
  color: string;
  icon: string;
}[] = [
  {
    id: "wave",
    label: "Wave",
    sublabel: "Paiement mobile instantané",
    color: "#009CDE",
    icon: "zap",
  },
  {
    id: "orange_money",
    label: "Orange Money",
    sublabel: "Transfert depuis votre compte Orange",
    color: "#FF6600",
    icon: "smartphone",
  },
  {
    id: "free_money",
    label: "Free Money",
    sublabel: "Transfert depuis votre compte Free",
    color: "#2ECC71",
    icon: "smartphone",
  },
  {
    id: "cash",
    label: "Espèces à la livraison",
    sublabel: "Payez en main propre à la réception",
    color: "#7B6B52",
    icon: "dollar-sign",
  },
];

const SENEGAL_CITIES = [
  "Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor",
  "Touba", "Mbour", "Diourbel", "Rufisque", "Fatick",
];

interface DeliveryForm {
  fullName: string;
  phone: string;
  address: string;
  quartier: string;
  ville: string;
}

export default function CheckoutScreen() {
  const {
    id,
    itemTitle,
    itemPrice,
    itemImage,
  } = useLocalSearchParams<{
    id: string;
    itemTitle?: string;
    itemPrice?: string;
    itemImage?: string;
  }>();

  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const price = Math.round(Number(itemPrice ?? 0));
  const fee = serviceFee(price);
  const deliveryFee = 1500;
  const total = price + deliveryFee;

  const [form, setForm] = useState<DeliveryForm>({
    fullName: "",
    phone: "",
    address: "",
    quartier: "",
    ville: "Dakar",
  });
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("wave");
  const [showCities, setShowCities] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const update = (key: keyof DeliveryForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid =
    form.fullName.trim() &&
    form.phone.trim().length >= 9 &&
    form.address.trim() &&
    form.quartier.trim() &&
    form.ville;

  const handleConfirm = useCallback(async () => {
    if (!isValid || confirming) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 1200));
    setConfirming(false);

    const paymentLabel = PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.label ?? "";
    router.replace({
      pathname: "/conversation/[id]",
      params: {
        id: `platform-${id}`,
        itemTitle: itemTitle ?? "",
        itemPrice: String(price),
        itemImage: itemImage ?? "",
        initialMessage:
          `✅ Commande confirmée !\n\n` +
          `Article : ${itemTitle}\n` +
          `Montant : ${fcfa(total)} (dont ${fcfa(deliveryFee)} de livraison)\n` +
          `Paiement : ${paymentLabel}\n` +
          `Livraison : ${form.quartier}, ${form.ville}\n\n` +
          `Votre commande est en cours de traitement. Vous serez notifié(e) dès l'expédition.`,
      },
    });
  }, [isValid, confirming, selectedPayment, id, itemTitle, itemImage, price, total, form, router]);

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
    // Item banner
    itemBanner: {
      flexDirection: "row",
      alignItems: "center",
      margin: 16,
      padding: 14,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    itemThumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: colors.muted },
    itemInfo: { flex: 1, gap: 4 },
    itemTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, lineHeight: 20 },
    itemPrice: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.primary },
    // Sections
    section: { marginHorizontal: 16, marginBottom: 16 },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 12,
    },
    fieldRow: { gap: 6 },
    fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: 0.5 },
    input: {
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    citySelector: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    citySelectorText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground },
    cityDropdown: {
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginTop: -8,
    },
    cityOption: {
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    cityOptionText: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground },
    // Payment methods
    paymentMethod: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 10,
      borderWidth: 1.5,
      gap: 12,
      marginBottom: 8,
    },
    paymentIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    paymentInfo: { flex: 1 },
    paymentLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    paymentSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    paymentRadio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    paymentRadioInner: { width: 10, height: 10, borderRadius: 5 },
    // Order summary
    summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    summaryValue: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground },
    summaryDivider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
    summaryTotalLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground },
    summaryTotalValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.primary },
    // Footer
    footer: {
      padding: 16,
      paddingBottom: bottomPad + 16,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    confirmBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
    },
    confirmBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
    confirmBtnDisabled: { opacity: 0.5 },
    secureNote: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      marginTop: 10,
    },
    secureText: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finaliser la commande</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Item banner */}
        <View style={styles.itemBanner}>
          {itemImage ? (
            <Image source={{ uri: itemImage }} style={styles.itemThumb} resizeMode="cover" />
          ) : (
            <View style={styles.itemThumb} />
          )}
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>{itemTitle ?? "Article"}</Text>
            <Text style={styles.itemPrice}>{fcfa(price)}</Text>
          </View>
          <Feather name="shield" size={18} color={colors.primary} />
        </View>

        {/* Delivery address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Adresse de livraison</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>NOM COMPLET</Text>
              <TextInput
                style={styles.input}
                value={form.fullName}
                onChangeText={(v) => update("fullName", v)}
                placeholder="Prénom et nom"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>TÉLÉPHONE</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(v) => update("phone", v)}
                placeholder="77 000 00 00"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>ADRESSE / RUE</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(v) => update("address", v)}
                placeholder="Numéro, rue, bâtiment…"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>QUARTIER</Text>
              <TextInput
                style={styles.input}
                value={form.quartier}
                onChangeText={(v) => update("quartier", v)}
                placeholder="ex. Plateau, Almadies, Ngor…"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>VILLE</Text>
              <TouchableOpacity
                style={styles.citySelector}
                onPress={() => setShowCities((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel="Choisir une ville"
              >
                <Text style={styles.citySelectorText}>{form.ville}</Text>
                <Feather name={showCities ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
              {showCities && (
                <View style={styles.cityDropdown}>
                  {SENEGAL_CITIES.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={styles.cityOption}
                      onPress={() => { update("ville", city); setShowCities(false); }}
                      accessibilityRole="button"
                      accessibilityLabel={city}
                    >
                      <Text style={[styles.cityOptionText, city === form.ville && { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Mode de paiement</Text>
          {PAYMENT_METHODS.map((pm) => {
            const selected = selectedPayment === pm.id;
            return (
              <TouchableOpacity
                key={pm.id}
                style={[
                  styles.paymentMethod,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.accent : colors.card,
                  },
                ]}
                onPress={() => setSelectedPayment(pm.id)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={pm.label}
              >
                <View style={[styles.paymentIconCircle, { backgroundColor: pm.color + "1A" }]}>
                  <Feather name={pm.icon as any} size={20} color={pm.color} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentLabel}>{pm.label}</Text>
                  <Text style={styles.paymentSub}>{pm.sublabel}</Text>
                </View>
                <View style={[styles.paymentRadio, { borderColor: selected ? colors.primary : colors.border }]}>
                  {selected && (
                    <View style={[styles.paymentRadioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧾 Récapitulatif</Text>
          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Article</Text>
              <Text style={styles.summaryValue}>{fcfa(price)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Livraison (Dakar)</Text>
              <Text style={styles.summaryValue}>{fcfa(deliveryFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Protection acheteur</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>Inclus</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{fcfa(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!isValid || confirming}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Confirmer et payer"
        >
          {confirming ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirmer et payer · {fcfa(total)}</Text>
          )}
        </TouchableOpacity>
        <View style={styles.secureNote}>
          <Feather name="lock" size={12} color={colors.mutedForeground} />
          <Text style={styles.secureText}>Paiement 100% sécurisé · Protection acheteur Diayko</Text>
        </View>
      </View>
    </View>
  );
}
