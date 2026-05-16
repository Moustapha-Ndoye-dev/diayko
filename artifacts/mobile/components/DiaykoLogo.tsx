/**
 * DiaykoLogo — brand component used in the app header and onboarding.
 * "Diayko" means "sell it" in Wolof (Senegal).
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path, Rect, Circle } from "react-native-svg";

interface DiaykoLogoProps {
  /** Width of the icon badge in points. The wordmark scales automatically. */
  size?: number;
  /** 'full'  → icon + text wordmark side-by-side (default)
   *  'icon'  → only the D badge
   *  'text'  → only the text wordmark
   */
  variant?: "full" | "icon" | "text";
  /** Override the wordmark colour (default: warm gold #F7941D) */
  wordmarkColor?: string;
}

/** Standalone D-badge rendered with react-native-svg */
function DIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Deep green → teal, inspired by Senegalese colours */}
        <LinearGradient id="diayko-bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0F3D2E" />
          <Stop offset="0.55" stopColor="#0A6B55" />
          <Stop offset="1" stopColor="#09B1BA" />
        </LinearGradient>
        {/* Gold gradient for the D letterform */}
        <LinearGradient id="diayko-d" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#FFD166" />
          <Stop offset="1" stopColor="#F7941D" />
        </LinearGradient>
      </Defs>

      {/* Rounded-square background */}
      <Rect width="100" height="100" rx="22" ry="22" fill="url(#diayko-bg)" />

      {/* Subtle decorative circle (geometric motif) */}
      <Circle cx="82" cy="20" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />

      {/* Bold D letterform (donut/hollow shape) */}
      <Path
        d="M 28 22 L 28 78 L 44 78 C 66 78 78 66 78 50 C 78 34 66 22 44 22 Z M 36 30 L 43 30 C 60 30 69 39 69 50 C 69 61 60 70 43 70 L 36 70 Z"
        fill="url(#diayko-d)"
      />

      {/* Price tag hanging from top-right of the D */}
      <Rect x="68" y="14" width="20" height="28" rx="4" ry="4" fill="#F7941D" />
      <Rect x="68" y="14" width="20" height="13" rx="4" ry="4" fill="#FFB347" />
      {/* Tag hole */}
      <Circle cx="78" cy="13" r="4" fill="#0A6B55" />
      <Circle cx="78" cy="13" r="2.2" fill="#0F3D2E" />
      {/* Tag lines */}
      <Rect x="72" y="32" width="12" height="2.5" rx="1.2" fill="rgba(255,255,255,0.85)" />
      <Rect x="72" y="36.5" width="8" height="2" rx="1" fill="rgba(255,255,255,0.55)" />
      <Rect x="72" y="40.5" width="10" height="2" rx="1" fill="rgba(255,255,255,0.55)" />
    </Svg>
  );
}

export function DiaykoLogo({
  size = 36,
  variant = "full",
  wordmarkColor = "#F7941D",
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
