import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { fcfa } from "@/lib/currency";

type TxType = "credit" | "debit";

interface Transaction {
  id: string;
  label: string;
  amount: number;
  type: TxType;
  date: string;
  method: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1", label: "Vente — Jean slim bleu", amount: 8500, type: "credit", date: "15 mai 2026", method: "Wave" },
  { id: "t2", label: "Retrait vers Wave", amount: 5000, type: "debit", date: "12 mai 2026", method: "Wave" },
  { id: "t3", label: "Vente — Robe wax", amount: 12000, type: "credit", date: "8 mai 2026", method: "Orange Money" },
  { id: "t4", label: "Vente — Sneakers blanches", amount: 15000, type: "credit", date: "3 mai 2026", method: "Free Money" },
  { id: "t5", label: "Retrait vers Orange Money", amount: 10000, type: "debit", date: "28 avr. 2026", method: "Orange Money" },
];

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const balance = 21000;

  const comingSoon = () =>
    Alert.alert("Bientôt disponible", "Cette fonctionnalité sera disponible dans une prochaine mise à jour.", [{ text: "OK" }]);

  const handleRecharge = () =>
    Alert.alert(
      "Recharger le portefeuille",
      "Choisissez un moyen de paiement pour ajouter des fonds.",
      [
        { text: "Wave", onPress: comingSoon },
        { text: "Orange Money", onPress: comingSoon },
        { text: "Free Money", onPress: comingSoon },
        { text: "Annuler", style: "cancel" },
      ]
    );

  const handleRetrait = () =>
    Alert.alert(
      "Retirer des fonds",
      `Solde disponible : ${fcfa(balance)}. Choisissez le compte de réception.`,
      [
        { text: "Vers Wave", onPress: comingSoon },
        { text: "Vers Orange Money", onPress: comingSoon },
        { text: "Annuler", style: "cancel" },
      ]
    );

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
    // Balance card
    balanceCard: {
      margin: 16,
      borderRadius: 16,
      backgroundColor: colors.primary,
      padding: 24,
      gap: 8,
    },
    balanceLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.75)" },
    balanceAmount: { fontSize: 34, fontFamily: "Inter_700Bold", color: "#fff" },
    balanceNote: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)" },
    actionsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: "rgba(255,255,255,0.18)",
      borderRadius: 10,
      paddingVertical: 10,
    },
    actionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
    // Payment methods
    sectionHeader: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      paddingTop: 4,
    },
    sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground },
    methodsCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    methodRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
      gap: 12,
    },
    methodIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    methodLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: colors.foreground },
    addBtn: {
      margin: 16,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderStyle: "dashed",
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    addBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.primary },
    // Transactions
    txCard: {
      marginHorizontal: 16,
      marginBottom: 4,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    txRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
      gap: 12,
    },
    txIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    txInfo: { flex: 1, gap: 2 },
    txLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground },
    txMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    txAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
    footer: { height: bottomPad + 24 },
  });

  const PAYMENT_COLORS: Record<string, string> = {
    "Wave": "#009CDE",
    "Orange Money": "#FF6600",
    "Free Money": "#2ECC71",
  };

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
        <Text style={styles.headerTitle}>Mon portefeuille</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceAmount}>{fcfa(balance)}</Text>
          <Text style={styles.balanceNote}>Utilisable pour vos achats sur Diayko</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Ajouter des fonds" onPress={handleRecharge}>
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Recharger</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Retirer" onPress={handleRetrait}>
              <Feather name="arrow-up" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Retirer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Linked payment methods */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Comptes liés</Text>
        </View>
        <View style={styles.methodsCard}>
          {[
            { label: "Wave", color: "#009CDE", icon: "zap" },
            { label: "Orange Money", color: "#FF6600", icon: "smartphone" },
            { label: "Free Money", color: "#2ECC71", icon: "smartphone" },
          ].map((m) => (
            <TouchableOpacity
              key={m.label}
              style={styles.methodRow}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={m.label}
              onPress={() => Alert.alert(m.label, `Compte ${m.label} lié à votre portefeuille Diayko.\nLes retraits vers ce compte sont disponibles sous 24h.`, [{ text: "OK" }])}
            >
              <View style={[styles.methodIconCircle, { backgroundColor: m.color + "1A" }]}>
                <Feather name={m.icon as any} size={18} color={m.color} />
              </View>
              <Text style={styles.methodLabel}>{m.label}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Ajouter un compte" onPress={comingSoon}>
          <Feather name="plus-circle" size={18} color={colors.primary} />
          <Text style={styles.addBtnText}>Ajouter un compte de paiement</Text>
        </TouchableOpacity>

        {/* Transaction history */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historique</Text>
        </View>
        <View style={styles.txCard}>
          {MOCK_TRANSACTIONS.map((tx, idx) => {
            const isCredit = tx.type === "credit";
            const methodColor = PAYMENT_COLORS[tx.method] ?? colors.primary;
            const isLast = idx === MOCK_TRANSACTIONS.length - 1;
            return (
              <View
                key={tx.id}
                style={[styles.txRow, isLast && { borderBottomWidth: 0 }]}
              >
                <View style={[styles.txIconCircle, { backgroundColor: isCredit ? colors.accent : "#FFF0EA" }]}>
                  <Feather
                    name={isCredit ? "trending-up" : "trending-down"}
                    size={16}
                    color={isCredit ? colors.primary : "#C84B1C"}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txLabel} numberOfLines={1}>{tx.label}</Text>
                  <Text style={styles.txMeta}>{tx.date} · {tx.method}</Text>
                </View>
                <Text style={[styles.txAmount, { color: isCredit ? colors.primary : "#C84B1C" }]}>
                  {isCredit ? "+" : "-"}{fcfa(tx.amount)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}
