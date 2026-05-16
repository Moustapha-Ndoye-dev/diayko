import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

// Seller profiles are not accessible to buyers — this protects seller anonymity.
// All items appear to be sold by the platform itself.
export default function SellerProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
      gap: 8,
    },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    body: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    title: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.accent,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginTop: 4,
    },
    badgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary },
    goBackBtn: {
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginTop: 8,
    },
    goBackText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.primary },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller profile</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Feather name="shield" size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Seller identity protected</Text>
        <Text style={styles.subtitle}>
          On Vinted, every item is sold through our secure marketplace. Seller
          identities remain private to protect both buyers and sellers.
        </Text>
        <View style={styles.badge}>
          <Feather name="check-circle" size={14} color={colors.primary} />
          <Text style={styles.badgeText}>All sellers are verified by Vinted</Text>
        </View>
        <TouchableOpacity
          style={styles.goBackBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back to browsing"
        >
          <Text style={styles.goBackText}>Back to browsing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
