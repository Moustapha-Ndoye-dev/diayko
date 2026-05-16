/**
 * DiaykoLogo — brand component used in the app header and onboarding.
 * "Diayko" means "sell it" in Wolof (Senegal).
 *
 * Palette: Senegalese flag green + gold star + terracotta market.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path, Rect, Circle } from "react-native-svg";

interface DiaykoLogoProps {
  /** Width of the icon badge in points. Wordmark scales automatically. */
  size?: number;
  /**
   * 'full'  → icon + text wordmark side-by-side (default)
   * 'icon'  → only the D badge
   * 'text'  → only the text wordmark
   */
  variant?: "full" | "icon" | "text";
  /** Override the wordmark colour (default: Senegalese green #00853F) */
  wordmarkColor?: string;
}

/** Standalone D-badge rendered with react-native-svg */
function DIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Deep forest green → Senegalese flag green */}
        <LinearGradient id="dyk-bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#004D22" />
          <Stop offset="0.6" stopColor="#00853F" />
          <Stop offset="1" stopColor="#1AA058" />
        </LinearGradient>
        {/* Gold gradient — étoile du drapeau sénégalais */}
        <LinearGradient id="dyk-d" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#FFD84D" />
          <Stop offset="1" stopColor="#F5C518" />
        </LinearGradient>
      </Defs>

      {/* Rounded-square background */}
      <Rect width="100" height="100" rx="22" ry="22" fill="url(#dyk-bg)" />

      {/* Subtle decorative arc — baobab motif */}
      <Circle cx="85" cy="18" r="26" fill="none" stroke="rgba(245,197,24,0.15)" strokeWidth="2" />
      <Circle cx="85" cy="18" r="16" fill="none" stroke="rgba(245,197,24,0.10)" strokeWidth="1.5" />

      {/* Bold D letterform — gold, hollow */}
      <Path
        d="M 28 22 L 28 78 L 44 78 C 66 78 78 66 78 50 C 78 34 66 22 44 22 Z M 36 30 L 43 30 C 60 30 69 39 69 50 C 69 61 60 70 43 70 L 36 70 Z"
        fill="url(#dyk-d)"
      />

      {/* Price tag hanging from top-right of the D — terracotta */}
      <Rect x="68" y="14" width="20" height="28" rx="4" ry="4" fill="#C84B1C" />
      {/* Tag highlight top */}
      <Rect x="68" y="14" width="20" height="12" rx="4" ry="4" fill="#D96030" />
      {/* Tag hole (string attachment) */}
      <Circle cx="78" cy="13" r="4" fill="#004D22" />
      <Circle cx="78" cy="13" r="2.2" fill="#003018" />
      {/* Tag price lines */}
      <Rect x="72" y="32" width="12" height="2.5" rx="1.2" fill="rgba(255,255,255,0.90)" />
      <Rect x="72" y="36.5" width="8" height="2" rx="1" fill="rgba(255,255,255,0.60)" />
      <Rect x="72" y="40.5" width="10" height="2" rx="1" fill="rgba(255,255,255,0.60)" />
    </Svg>
  );
}

export function DiaykoLogo({
  size = 36,
  variant = "full",
  wordmarkColor = "#00853F",
}: DiaykoLogoProps) {
  if (variant === "icon") {
    return <DIcon size={size} />;
  }

  if (variant === "text") {
    return (
      <Text
        style={[styles.wordmark, { color: wordmarkColor, fontSize: size * 0.62 }]}
        accessibilityLabel="Diayko"
      >
        diayko
      </Text>
    );
  }

  // Full: icon + wordmark
  return (
    <View style={styles.row} accessibilityLabel="Diayko">
      <DIcon size={size} />
      <Text style={[styles.wordmark, { color: wordmarkColor, fontSize: size * 0.6 }]}>
        diayko
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wordmark: {
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
});
