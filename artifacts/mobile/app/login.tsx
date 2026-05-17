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

function DiaykoIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="lg-bg2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#004D22" />
          <Stop offset="0.6" stopColor="#00853F" />
          <Stop offset="1" stopColor="#1AA058" />
        </SvgGradient>
        <SvgGradient id="lg-d2" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#FFD84D" />
          <Stop offset="1" stopColor="#F5C518" />
        </SvgGradient>
      </Defs>
      <Rect width="100" height="100" rx="22" ry="22" fill="url(#lg-bg2)" />
      <Circle cx="85" cy="18" r="26" fill="none" stroke="rgba(245,197,24,0.15)" strokeWidth="2" />
      <Path
        d="M 28 22 L 28 78 L 44 78 C 66 78 78 66 78 50 C 78 34 66 22 44 22 Z M 36 30 L 43 30 C 60 30 69 39 69 50 C 69 61 60 70 43 70 L 36 70 Z"
        fill="url(#lg-d2)"
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

  const topPad = Platform.OS === "web" ? 80 : insets.top + 60;
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
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>

      {/* Centre — tout le contenu principal groupé */}
      <View style={styles.center}>
        {/* Identity */}
        <View style={styles.identity}>
          <View style={styles.logoWrap}>
            <DiaykoIcon size={80} />
          </View>
          <Text style={styles.wordmark}>diayko</Text>
          <Text style={styles.tagline}>
            La mode de seconde main{"\n"}au Sénégal
          </Text>
        </View>

        {/* Gold divider */}
        <View style={styles.divider} />

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, pending && styles.btnDisabled]}
            onPress={handleAuth}
            disabled={pending}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Commencer"
            accessibilityState={{ disabled: pending, busy: pending }}
          >
            {pending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Commencer</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAuth}
            disabled={pending}
            activeOpacity={0.6}
            style={styles.loginLink}
            accessibilityRole="button"
            accessibilityLabel="Se connecter"
            hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
          >
            <Text style={styles.loginLinkText}>
              Déjà un compte ?{" "}
              <Text style={styles.loginLinkBold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legal — ancré en bas */}
      <Text style={styles.legal}>
        En continuant, vous acceptez nos{" "}
        <Text style={styles.legalLink}>Conditions</Text> et notre{" "}
        <Text style={styles.legalLink}>Politique de confidentialité</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    gap: 32,
    paddingBottom: 24,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  // Identity block
  identity: {
    alignItems: "center",
    gap: 12,
  },
  logoWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 4,
  },
  wordmark: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
    letterSpacing: -1.5,
    color: "#0a0a0a",
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 24,
  },

  // Gold divider
  divider: {
    height: 3,
    width: 40,
    borderRadius: 2,
    backgroundColor: GOLD,
    alignSelf: "center",
  },

  // Actions block
  actions: {
    gap: 4,
  },
  btn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#fff",
    letterSpacing: 0.1,
  },
  loginLink: {
    alignItems: "center",
    paddingVertical: 14,
  },
  loginLinkText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#999",
  },
  loginLinkBold: {
    fontFamily: "Inter_600SemiBold",
    color: GREEN,
  },

  // Legal
  legal: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#bbb",
    textAlign: "center",
    lineHeight: 18,
  },
  legalLink: {
    color: "#999",
  },
});
