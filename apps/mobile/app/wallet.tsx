import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { api, type ApiWallet, type ApiWalletTransaction } from "@/lib/api";
import { fcfa } from "@/lib/currency";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-SN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [wallet, setWallet] = useState<ApiWallet | null>(null);
  const [transactions, setTransactions] = useState<ApiWalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [walletRes, txRes] = await Promise.all([
        api.wallet.get(),
        api.wallet.transactions(),
      ]);
      setWallet(walletRes);
      setTransactions(txRes.transactions);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const balance = wallet?.available ?? 0;
  const pending = wallet?.pending ?? 0;

  const handleWithdraw = () => {
    Alert.alert(
      "Retrait",
      "Le solde est synchronise avec l'API. Le formulaire de retrait complet arrive dans l'ecran suivant.",
      [{ text: "OK" }],
    );
  };

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
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: 28,
    },
    centerTitle: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
    },
    centerText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    retryBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    retryText: { color: "#fff", fontFamily: "Inter_600SemiBold" },
    balanceCard: {
      margin: 16,
      borderRadius: 16,
      backgroundColor: colors.primary,
      padding: 24,
      gap: 8,
    },
    balanceLabel: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.75)",
    },
    balanceAmount: { fontSize: 34, fontFamily: "Inter_700Bold", color: "#fff" },
    balanceNote: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.72)",
    },
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
    sectionHeader: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      paddingTop: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
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
    methodLabel: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
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
    txMeta: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    txAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
    emptyTx: {
      padding: 18,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    footer: { height: bottomPad + 24 },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon portefeuille</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon portefeuille</Text>
        </View>
        <View style={styles.center}>
          <Feather name="wifi-off" size={44} color={colors.border} />
          <Text style={styles.centerTitle}>Portefeuille indisponible</Text>
          <Text style={styles.centerText}>Impossible de synchroniser avec l'API.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadWallet}>
            <Text style={styles.retryText}>Reessayer</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Mon portefeuille</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceAmount}>{fcfa(balance)}</Text>
          <Text style={styles.balanceNote}>
            En attente: {fcfa(pending)} - Devise: {wallet?.currency ?? "XOF"}
          </Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              accessibilityRole="button"
              accessibilityLabel="Actualiser"
              onPress={loadWallet}
            >
              <Feather name="refresh-cw" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Actualiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              accessibilityRole="button"
              accessibilityLabel="Retirer"
              onPress={handleWithdraw}
            >
              <Feather name="arrow-up" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Retirer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Comptes lies</Text>
        </View>
        <View style={styles.methodsCard}>
          {[
            { label: "Wave", color: "#009CDE", icon: "zap" },
            { label: "Orange Money", color: "#FF6600", icon: "smartphone" },
            { label: "Free Money", color: "#2ECC71", icon: "smartphone" },
          ].map((m, index, rows) => (
            <TouchableOpacity
              key={m.label}
              style={[styles.methodRow, index === rows.length - 1 && { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={m.label}
              onPress={() => Alert.alert(m.label, "Compte de paiement pret a etre relie.")}
            >
              <View style={[styles.methodIconCircle, { backgroundColor: `${m.color}1A` }]}>
                <Feather name={m.icon as any} size={18} color={m.color} />
              </View>
              <Text style={styles.methodLabel}>{m.label}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historique API</Text>
        </View>
        <View style={styles.txCard}>
          {transactions.length === 0 ? (
            <Text style={styles.emptyTx}>Aucune transaction pour le moment.</Text>
          ) : (
            transactions.map((tx, index) => {
              const isCredit = tx.type === "credit";
              return (
                <View
                  key={tx.id}
                  style={[
                    styles.txRow,
                    index === transactions.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View
                    style={[
                      styles.txIconCircle,
                      { backgroundColor: isCredit ? colors.accent : "#FFF0EA" },
                    ]}
                  >
                    <Feather
                      name={isCredit ? "trending-up" : "trending-down"}
                      size={16}
                      color={isCredit ? colors.primary : "#C84B1C"}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txLabel} numberOfLines={1}>
                      {tx.label}
                    </Text>
                    <Text style={styles.txMeta}>
                      {formatDate(tx.createdAt)} - {tx.method} - {tx.status ?? "ok"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: isCredit ? colors.primary : "#C84B1C" },
                    ]}
                  >
                    {isCredit ? "+" : "-"}
                    {fcfa(tx.amount)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}
