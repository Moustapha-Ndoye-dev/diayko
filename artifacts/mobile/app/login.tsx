import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
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

const GREEN      = "#00853F";
const DARK_GREEN = "#004D22";
const GOLD       = "#F5C518";
const TERRACOTTA = "#C84B1C";

const HERO = require("../assets/images/login_hero.png");

function DiaykoIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="bg4" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#004D22" />
          <Stop offset="0.6" stopColor="#00853F" />
          <Stop offset="1" stopColor="#1AA058" />
        </SvgGradient>
        <SvgGradient id="d4" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#FFD84D" />
          <Stop offset="1" stopColor="#F5C518" />
        </SvgGradient>
      </Defs>
      <Rect width="100" height="100" rx="22" ry="22" fill="url(#bg4)" />
      <Circle cx="85" cy="18" r="26" fill="none" stroke="rgba(245,197,24,0.15)" strokeWidth="2" />
      <Path
        d="M 28 22 L 28 78 L 44 78 C 66 78 78 66 78 50 C 78 34 66 22 44 22 Z M 36 30 L 43 30 C 60 30 69 39 69 50 C 69 61 60 70 43 70 L 36 70 Z"
        fill="url(#d4)"
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

  const topPad    = Platform.OS === "web" ? 48 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 36 : insets.bottom + 24;

  async function handleAuth() {
    setPending(true);
    try { await login(); } finally { setPending(false); }
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

      {/* ── Hero image ─────────────────────────────────────────── */}
      <Image source={HERO} style={styles.hero} resizeMode="cover" />

      {/* ── Gradient: légèrement sombre en haut + très sombre en bas ── */}
      <LinearGradient
        colors={[
          "rgba(0,30,10,0.55)",   // haut — assez sombre pour lisibilité logo
          "transparent",           // milieu — laisse respirer l'image
          "rgba(0,26,10,0.40)",
          "rgba(0,40,16,0.88)",   // bas — prépare la sheet
          DARK_GREEN,              // fond continu avec la sheet
        ]}
        locations={[0, 0.22, 0.50, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Top bar ────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <View style={styles.logoPill}>
          <DiaykoIcon size={24} />
          <Text style={styles.pillWord}>diayko</Text>
        </View>

        {/* Chip "Sénégal" */}
        <View style={styles.senegalChip}>
          <View style={styles.chipDot} />
          <Text style={styles.chipText}>Dakar, Sénégal</Text>
        </View>
      </View>

      {/* ── Bottom sheet ───────────────────────────────────────── */}
      <View style={[styles.sheet, { paddingBottom: bottomPad }]}>

        {/* Label */}
        <Text style={styles.overline}>MARKETPLACE DE MODE</Text>

        {/* Headline */}
        <Text style={styles.headline}>
          La seconde main,{"\n"}réinventée.
        </Text>

        {/* Gold rule */}
        <View style={styles.rule} />

        {/* Sous-titre */}
        <Text style={styles.sub}>
          Des milliers d'articles wax, bazin et prêt-à-porter à petits prix. Achetez et vendez en quelques minutes.
        </Text>

        {/* Bouton primaire — vert marque */}
        <TouchableOpacity
          style={[styles.btnGreen, pending && { opacity: 0.6 }]}
          onPress={handleAuth}
          disabled={pending}
          activeOpacity={0.87}
          accessibilityRole="button"
          accessibilityLabel="Commencer gratuitement"
          accessibilityState={{ disabled: pending, busy: pending }}
        >
          {pending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnGreenText}>Commencer gratuitement</Text>
          )}
        </TouchableOpacity>

        {/* Bouton secondaire — contour or */}
        <TouchableOpacity
          style={styles.btnGold}
          onPress={handleAuth}
          disabled={pending}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Se connecter"
        >
          <Text style={styles.btnGoldText}>J'ai déjà un compte</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          En continuant, vous acceptez nos{" "}
          <Text style={styles.legalLink}>Conditions</Text>
          {"  ·  "}
          <Text style={styles.legalLink}>Confidentialité</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK_GREEN,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  // Hero
  hero: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  // Top bar
  topBar: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(0,0,0,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillWord: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#fff",
    letterSpacing: -0.3,
  },
  senegalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderWidth: 1,
    borderColor: `rgba(245,197,24,0.35)`,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GOLD,
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.90)",
  },

  // Sheet
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 10,
  },
  overline: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 2,
    color: GOLD,
  },
  headline: {
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.6,
    color: "#fff",
  },
  rule: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: GREEN,
    marginVertical: 2,
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.70)",
    lineHeight: 21,
    marginBottom: 4,
  },

  // Bouton vert (primaire)
  btnGreen: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  btnGreenText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16.5,
    color: "#fff",
    letterSpacing: 0.1,
  },

  // Bouton or (secondaire)
  btnGold: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  btnGoldText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15.5,
    color: GOLD,
    letterSpacing: 0.1,
  },

  // Legal
  legal: {
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    color: "rgba(255,255,255,0.30)",
    textAlign: "center",
    lineHeight: 17,
    paddingTop: 2,
  },
  legalLink: {
    color: "rgba(255,255,255,0.50)",
  },
});
