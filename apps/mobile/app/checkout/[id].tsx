import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { api, type ApiCheckoutQuote, type ApiPaymentMethod } from "@/lib/api";
import { fcfa, serviceFee } from "@/lib/currency";

type PaymentMethod = ApiPaymentMethod;

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
    sublabel: "Paiement mobile instantane",
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
    label: "Especes a la livraison",
    sublabel: "Payez a la reception",
    color: "#7B6B52",
    icon: "dollar-sign",
  },
];

const SENEGAL_CITIES = [
  "Dakar",
  "Thies",
  "Saint-Louis",
  "Kaolack",
  "Ziguinchor",
  "Touba",
  "Mbour",
  "Diourbel",
  "Rufisque",
  "Fatick",
];

type DeliveryForm = {
  fullName: string;
  phone: string;
  address: string;
  quartier: string;
  ville: string;
};

export default function CheckoutScreen() {
  const { id, itemTitle, itemPrice, itemImage } = useLocalSearchParams<{
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
  const fallbackFee = serviceFee(price);

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
  const [quote, setQuote] = useState<ApiCheckoutQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setQuoteLoading(true);
    api.checkout
      .quote({ itemId: id, paymentMethod: selectedPayment })
      .then((nextQuote) => {
        if (!cancelled) setQuote(nextQuote);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, selectedPayment]);

  const protectionFee = quote?.serviceFee ?? fallbackFee;
  const total = quote?.total ?? price + protectionFee;

  const update = (key: keyof DeliveryForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isValid =
    Boolean(id) &&
    form.fullName.trim().length > 1 &&
    form.phone.trim().length >= 9 &&
    form.address.trim().length > 2 &&
    form.quartier.trim().length > 1 &&
    form.ville.length > 0;

  const handleConfirm = useCallback(async () => {
    if (!isValid || confirming) return;
    setConfirming(true);
    try {
      await api.orders.create({
        itemId: id,
        paymentMethod: selectedPayment,
        deliveryAddress: {
          name: form.fullName.trim(),
          city: form.ville,
          phone: form.phone.trim(),
          line1: `${form.address.trim()}, ${form.quartier.trim()}`,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/my-purchases");
    } catch {
      Alert.alert(
        "Commande impossible",
        "L'article n'est peut-etre plus disponible. Reessayez dans un instant.",
        [{ text: "OK" }],
      );
    } finally {
      setConfirming(false);
    }
  }, [isValid, confirming, selectedPayment, id, form, router]);

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
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
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
    itemThumb: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: colors.muted,
    },
    itemInfo: { flex: 1, gap: 4 },
    itemTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      lineHeight: 20,
    },
    itemPrice: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
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
    fieldLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 0.5,
    },
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
    citySelectorText: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
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
    cityOptionText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
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
    paymentLabel: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    paymentSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 1,
    },
    paymentRadio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    paymentRadioInner: { width: 10, height: 10, borderRadius: 5 },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    summaryValue: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 10,
    },
    summaryTotalLabel: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    summaryTotalValue: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
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
    confirmBtnText: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    confirmBtnDisabled: { opacity: 0.5 },
    secureNote: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      marginTop: 10,
    },
    secureText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
  });

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
        <Text style={styles.headerTitle}>Finaliser la commande</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.itemBanner}>
          {itemImage ? (
            <Image source={{ uri: itemImage }} style={styles.itemThumb} resizeMode="cover" />
          ) : (
            <View style={styles.itemThumb} />
          )}
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {itemTitle ?? "Article"}
            </Text>
            <Text style={styles.itemPrice}>{fcfa(price)}</Text>
          </View>
          <Feather name="shield" size={18} color={colors.primary} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>NOM COMPLET</Text>
              <TextInput
                style={styles.input}
                value={form.fullName}
                onChangeText={(v) => update("fullName", v)}
                placeholder="Prenom et nom"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>TELEPHONE</Text>
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
                placeholder="Numero, rue, batiment"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>QUARTIER</Text>
              <TextInput
                style={styles.input}
                value={form.quartier}
                onChangeText={(v) => update("quartier", v)}
                placeholder="ex. Plateau, Almadies, Ngor"
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
                <Feather
                  name={showCities ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
              {showCities && (
                <View style={styles.cityDropdown}>
                  {SENEGAL_CITIES.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={styles.cityOption}
                      onPress={() => {
                        update("ville", city);
                        setShowCities(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={city}
                    >
                      <Text
                        style={[
                          styles.cityOptionText,
                          city === form.ville && {
                            color: colors.primary,
                            fontFamily: "Inter_600SemiBold",
                          },
                        ]}
                      >
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
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
                <View style={[styles.paymentIconCircle, { backgroundColor: `${pm.color}1A` }]}>
                  <Feather name={pm.icon as any} size={20} color={pm.color} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentLabel}>{pm.label}</Text>
                  <Text style={styles.paymentSub}>{pm.sublabel}</Text>
                </View>
                <View
                  style={[
                    styles.paymentRadio,
                    { borderColor: selected ? colors.primary : colors.border },
                  ]}
                >
                  {selected && (
                    <View
                      style={[styles.paymentRadioInner, { backgroundColor: colors.primary }]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recapitulatif</Text>
          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Article</Text>
              <Text style={styles.summaryValue}>{fcfa(price)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais Diayko</Text>
              <Text style={styles.summaryValue}>
                {quoteLoading ? "Calcul..." : fcfa(protectionFee)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Protection acheteur</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>Incluse</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{fcfa(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, (!isValid || confirming) && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!isValid || confirming}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Confirmer et payer"
        >
          {confirming ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirmer et payer - {fcfa(total)}</Text>
          )}
        </TouchableOpacity>
        <View style={styles.secureNote}>
          <Feather name="lock" size={12} color={colors.mutedForeground} />
          <Text style={styles.secureText}>Paiement securise - Protection acheteur Diayko</Text>
        </View>
      </View>
    </View>
  );
}
