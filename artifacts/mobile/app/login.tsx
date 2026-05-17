import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Path,
  Rect,
  Circle,
} from "react-native-svg";
import { useAuth } from "@/lib/auth";

const GREEN = "#00853F";
const DARK_GREEN = "#004D22";
const GOLD = "#F5C518";
const TERRACOTTA = "#C84B1C";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&q=85";

function DiaykoIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="bg3" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#004D22" />
          <Stop offset="0.6" stopColor="#00853F" />
          <Stop offset="1" stopColor="#1AA058" />
        </SvgGradient>
        <SvgGradient id="d3" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#FFD84D" />
          <Stop offset="1" stopColor="#F5C518" />
        </SvgGradient>
      </Defs>
      <Rect width="100" height="100" rx="22" ry="22" fill="url(#bg3)" />
      <Circle cx="85" cy="18" r="26" fill="none" stroke="rgba(245,197,24,0.15)" strokeWidth="2" />
      <Path
        d="M 28 22 L 28 78 L 44 78 C 66 78 78 66 78 50 C 78 34 66 22 44 22 Z M 36 30 L 43 30 C 60 30 69 39 69 50 C 69 61 60 70 43 70 L 36 70 Z"
        fill="url(#d3)"
      />
      <Rect x="68" y="14" width="20" height="28" rx="4" ry="4" fill={TERRACOTTA} />
      <Rect x="68" y="14" width="20" height="12" rx="4" ry="4" fill="#D96030" />
      <Circle cx="78" cy="13" r="4" fill={DARK_GREEN} />
      <Circle cx="78" cy="13" r="2.2" fill="#003018" />
      <Rect x="72" y="32" width="12" height="2.5" rx="1.2" fill="rgba(255,255,255,0.90)" />
      <Rect x="72" y="36.5" width="8" height="2" rx="1" fill="rgba(255,255,255,0.60)" />
      <Rect x="72" y="40.5" width="10" height="2" rx="1" fill="rgba(255,255,255,0.60)" />
    </Svg>
  );
}

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [pending, setPending] = React.useState(false);
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 52 : insets.top + 20;
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom + 24;

  async function handleAuth() {
    setPending(true);
    try {
      await login();
    } finally {
      setPending(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Hero background */}
      <ImageBackground
        source={{ uri: HERO_IMAGE }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Gradient overlay — dark at top, fades then strong at bottom */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.35)",
          "transparent",
          "rgba(0,0,0,0.10)",
          "rgba(3,20,10,0.82)",
          "#03140A",
        ]}
        locations={[0, 0.28, 0.45, 0.70, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top — logo pill */}
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <View style={styles.logoPill}>
          <DiaykoIcon size={26} />
          <Text style={styles.pillWordmark}>diayko</Text>
        </View>
      </View>

      {/* Bottom sheet */}
      <View style={[styles.sheet, { paddingBottom: bottomPad }]}>
        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.headlineSmall}>Marketplace de mode</Text>
          <Text style={styles.headlineBig}>Seconde main,{"\n"}premier choix.</Text>
          <View style={styles.goldAccent} />
        </View>

        {/* CTA primary */}
        <TouchableOpacity
          style={[styles.btnPrimary, pending && styles.btnDisabled]}
          onPress={handleAuth}
          disabled={pending}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Commencer"
          accessibilityState={{ disabled: pending, busy: pending }}
        >
          {pending ? (
            <ActivityIndicator color={DARK_GREEN} />
          ) : (
            <Text style={styles.btnPrimaryText}>Commencer gratuitement</Text>
          )}
        </TouchableOpacity>

        {/* CTA secondary */}
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={handleAuth}
          disabled={pending}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Se connecter"
        >
          <Text style={styles.btnSecondaryText}>J'ai déjà un compte</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          En continuant, vous acceptez nos{" "}
          <Text style={styles.legalLink}>Conditions</Text>
          {" "}·{" "}
          <Text style={styles.legalLink}>Confidentialité</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#03140A",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  // Top bar
  topBar: {
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  logoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillWordmark: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
    letterSpacing: -0.3,
  },

  // Bottom sheet
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 12,
  },

  // Headline
  headline: {
    marginBottom: 8,
    gap: 6,
  },
  headlineSmall: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headlineBig: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: "#fff",
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  goldAccent: {
    width: 36,
    height: 3,
    backgroundColor: GOLD,
    borderRadius: 2,
    marginTop: 4,
  },

  // Buttons
  btnPrimary: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16.5,
    color: DARK_GREEN,
    letterSpacing: 0.1,
  },
  btnSecondary: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.30)",
  },
  btnSecondaryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15.5,
    color: "rgba(255,255,255,0.90)",
    letterSpacing: 0.1,
  },

  // Legal
  legal: {
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    lineHeight: 17,
    paddingTop: 2,
  },
  legalLink: {
    color: "rgba(255,255,255,0.55)",
  },
});
