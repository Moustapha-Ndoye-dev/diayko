import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
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
import { storage } from "@/lib/storage";

const { height } = Dimensions.get("window");
const GREEN = "#00853F";
const DARK_GREEN = "#004D22";
const GOLD = "#F5C518";
const TERRACOTTA = "#C84B1C";

function DiaykoIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="lg-bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#004D22" />
          <Stop offset="0.6" stopColor="#00853F" />
          <Stop offset="1" stopColor="#1AA058" />
        </SvgGradient>
        <SvgGradient id="lg-d" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#FFD84D" />
          <Stop offset="1" stopColor="#F5C518" />
        </SvgGradient>
      </Defs>
      <Rect width="100" height="100" rx="22" ry="22" fill="url(#lg-bg)" />
      <Circle cx="85" cy="18" r="26" fill="none" stroke="rgba(245,197,24,0.15)" strokeWidth="2" />
      <Circle cx="85" cy="18" r="16" fill="none" stroke="rgba(245,197,24,0.10)" strokeWidth="1.5" />
      <Path
        d="M 28 22 L 28 78 L 44 78 C 66 78 78 66 78 50 C 78 34 66 22 44 22 Z M 36 30 L 43 30 C 60 30 69 39 69 50 C 69 61 60 70 43 70 L 36 70 Z"
        fill="url(#lg-d)"
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
  const { login, signup, isLoading } = useAuth();
  const [pending, setPending] = React.useState<"login" | "signup" | null>(null);
  const [isFirstTime, setIsFirstTime] = React.useState<boolean | null>(null);
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 60 : insets.top + 40;
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom + 24;

  React.useEffect(() => {
    storage.firstVisit.isFirstTime().then(setIsFirstTime);
  }, []);

  async function handleSignup() {
    setPending("signup");
    try {
      await storage.firstVisit.markDone();
      await signup();
    } finally {
      setPending(null);
    }
  }

  async function handleLogin() {
    setPending("login");
    try {
      await storage.firstVisit.markDone();
      await login();
    } finally {
      setPending(null);
    }
  }

  if (isLoading || isFirstTime === null) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[DARK_GREEN, GREEN, "#0A9B50"]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[DARK_GREEN, "#006B32", GREEN]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <View style={[styles.decCircle, styles.decCircle1]} />
      <View style={[styles.decCircle, styles.decCircle2]} />
      <View style={[styles.decCircle, styles.decCircle3]} />

      {/* Top area */}
      <View style={[styles.top, { paddingTop: topPad }]}>
        <View style={styles.iconShadowWrap}>
          <DiaykoIcon size={96} />
        </View>
        <Text style={styles.wordmark}>diayko</Text>
        <Text style={styles.tagline}>
          La marketplace de la mode{"\n"}de seconde main au Sénégal
        </Text>
      </View>

      {/* Bottom card */}
      <View style={[styles.card, { paddingBottom: bottomPad }]}>
        <View style={styles.goldBar} />

        {isFirstTime ? (
          /* ── PREMIÈRE VISITE : un seul bouton S'inscrire ── */
          <>
            <Text style={styles.cardTitle}>Bienvenue sur Diayko</Text>
            <Text style={styles.cardSubtitle}>
              Créez votre compte gratuit et rejoignez des milliers
              d'acheteurs et vendeurs au Sénégal.
            </Text>

            <View style={styles.features}>
              {[
                { icon: "🛍️", text: "Des milliers d'articles" },
                { icon: "🔒", text: "Paiements sécurisés" },
                { icon: "🚀", text: "Vendez en quelques minutes" },
              ].map((f) => (
                <View key={f.text} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, pending && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={!!pending}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[GREEN, "#007A38", DARK_GREEN]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {pending === "signup" ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Créer mon compte</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnTextLink}
              onPress={handleLogin}
              disabled={!!pending}
              activeOpacity={0.7}
            >
              {pending === "login" ? (
                <ActivityIndicator color={GREEN} size="small" />
              ) : (
                <Text style={styles.btnTextLinkLabel}>
                  Déjà un compte ?{" "}
                  <Text style={styles.btnTextLinkStrong}>Se connecter</Text>
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          /* ── RETOUR : deux boutons séparés ── */
          <>
            <Text style={styles.cardTitle}>Bon retour sur Diayko</Text>
            <Text style={styles.cardSubtitle}>
              Connectez-vous pour accéder à vos articles, messages et favoris.
            </Text>

            <TouchableOpacity
              style={[styles.btnPrimary, pending && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={!!pending}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[GREEN, "#007A38", DARK_GREEN]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {pending === "login" ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Se connecter</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnSecondary, pending && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={!!pending}
              activeOpacity={0.88}
            >
              {pending === "signup" ? (
                <ActivityIndicator color={GREEN} />
              ) : (
                <Text style={styles.btnSecondaryText}>Créer un compte</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.legal}>
          En continuant, vous acceptez nos{" "}
          <Text style={styles.legalLink}>Conditions d'utilisation</Text> et notre{" "}
          <Text style={styles.legalLink}>Politique de confidentialité</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_GREEN },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },

  decCircle: {
    position: "absolute",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  decCircle1: {
    width: 340,
    height: 340,
    top: -80,
    right: -80,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  decCircle2: {
    width: 200,
    height: 200,
    top: 60,
    left: -60,
    borderColor: "rgba(245,197,24,0.10)",
  },
  decCircle3: {
    width: 160,
    height: 160,
    bottom: height * 0.45,
    right: -40,
    borderColor: "rgba(245,197,24,0.08)",
  },

  top: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  iconShadowWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    marginBottom: 16,
  },
  wordmark: {
    fontFamily: "Inter_700Bold",
    fontSize: 38,
    color: "#fff",
    letterSpacing: -1,
    marginBottom: 10,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  goldBar: {
    width: 48,
    height: 4,
    backgroundColor: GOLD,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#111",
    marginBottom: 6,
    textAlign: "center",
  },
  cardSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 20,
  },

  features: { marginBottom: 24, gap: 10 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  featureIcon: { fontSize: 18 },
  featureText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#333",
  },

  btnPrimary: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnGradient: {
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#fff",
    letterSpacing: 0.2,
  },
  btnDisabled: { opacity: 0.65 },

  btnSecondary: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: GREEN,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  btnSecondaryText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: GREEN,
    letterSpacing: 0.2,
  },

  btnTextLink: {
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 4,
  },
  btnTextLinkLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#888",
  },
  btnTextLinkStrong: {
    fontFamily: "Inter_600SemiBold",
    color: GREEN,
  },

  legal: {
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 17,
    marginTop: 8,
  },
  legalLink: {
    color: GREEN,
    fontFamily: "Inter_500Medium",
  },
});
