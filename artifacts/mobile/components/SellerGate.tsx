import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

interface BenefitProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

function Benefit({ icon, title, description }: BenefitProps) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: colors.foreground,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Inter_400Regular",
            color: colors.mutedForeground,
            lineHeight: 19,
          }}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

export function SellerGate() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sellerStatus, requestSellerAccess } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isPending = sellerStatus === "pending";

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
    content: { padding: 20, gap: 22 },
    hero: {
      alignItems: "center",
      gap: 14,
      paddingVertical: 24,
    },
    heroIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    heroTitle: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
      letterSpacing: -0.4,
    },
    heroSub: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: 16,
    },
    benefitsCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      gap: 16,
    },
    cta: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    ctaPending: {
      backgroundColor: colors.muted,
    },
    ctaText: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    ctaTextPending: {
      color: colors.foreground,
    },
    legal: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 17,
    },
    pendingNote: {
      backgroundColor: colors.accent,
      borderRadius: colors.radius,
      padding: 14,
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    pendingText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
      lineHeight: 19,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Become a seller</Text>
        <Text style={styles.subtitle}>
          Unlock listings and start selling your wardrobe
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Feather name="award" size={32} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Turn your closet into cash</Text>
          <Text style={styles.heroSub}>
            Join thousands of sellers giving second life to fashion. Verification
            usually takes less than a minute.
          </Text>
        </View>

        {isPending && (
          <View style={styles.pendingNote}>
            <Feather name="clock" size={16} color={colors.primary} />
            <Text style={styles.pendingText}>
              Your request is under review. We'll notify you once you're approved
              — this usually takes a moment.
            </Text>
          </View>
        )}

        <View style={styles.benefitsCard}>
          <Benefit
            icon="upload-cloud"
            title="List unlimited items"
            description="Photos, prices, descriptions — list as much as you want."
          />
          <Benefit
            icon="shield"
            title="Buyer protection"
            description="We hold payments until the buyer confirms delivery."
          />
          <Benefit
            icon="trending-up"
            title="Seller analytics"
            description="Track views, favourites and offers on every listing."
          />
          <Benefit
            icon="message-circle"
            title="Direct messaging"
            description="Negotiate offers and answer questions in real time."
          />
        </View>

        <TouchableOpacity
          style={[styles.cta, isPending && styles.ctaPending]}
          onPress={requestSellerAccess}
          disabled={isPending}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={
            isPending ? "Request pending" : "Submit seller request"
          }
        >
          {isPending ? (
            <>
              <ActivityIndicator size="small" color={colors.foreground} />
              <Text style={[styles.ctaText, styles.ctaTextPending]}>
                Awaiting approval…
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.ctaText}>Submit request</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.legal}>
          By submitting, you agree to our seller terms and our community guidelines.
        </Text>
      </View>
    </View>
  );
}
