/**
 * Diayko design tokens — palette "Sénégal"
 *
 * Inspired by:
 *   - Drapeau sénégalais : vert #00853F · or #F5C518 · rouge
 *   - Architecture de Dakar : ocre, sable, terracotta
 *   - Nature : baobab, mer, soleil levant
 */
const colors = {
  light: {
    text: "#1A1E1A",

    // Tint is used by Expo Router for the active tab icon.
    tint: "#00853F",

    // ── Backgrounds ────────────────────────────────────────────────────────
    /** Warm sandy cream — like Saly or Casamance beaches. */
    background: "#FDF8F0",
    foreground: "#1A1E1A",

    // ── Card ───────────────────────────────────────────────────────────────
    card: "#FFFFFF",
    cardForeground: "#1A1E1A",

    // ── Primary — Senegalese flag green ────────────────────────────────────
    primary: "#00853F",
    primaryForeground: "#FFFFFF",

    // ── Secondary — warm sand ──────────────────────────────────────────────
    secondary: "#F5EDE0",
    secondaryForeground: "#1A1E1A",

    // ── Muted — earthy baobab tones ────────────────────────────────────────
    muted: "#F5EDE0",
    mutedForeground: "#7B6B52",

    // ── Accent — light green for highlights / info cards ──────────────────
    accent: "#EEFAF2",
    accentForeground: "#00853F",

    // ── Semantic ───────────────────────────────────────────────────────────
    destructive: "#C84B1C",
    destructiveForeground: "#FFFFFF",

    /** Gold — étoile du drapeau sénégalais. Used for badges, ratings, highlights. */
    warning: "#F5C518",
    /** Same as primary for consistency. */
    success: "#00853F",

    // ── Borders / inputs ──────────────────────────────────────────────────
    border: "#E8D9C3",
    input: "#E8D9C3",

    // ── Tab bar & separators ──────────────────────────────────────────────
    tabBar: "#FFFFFF",
    separator: "#F0E4CF",

    /** Login hero — aligné gradient logo D (#004D22 → #00853F) + fond sombre bas */
    loginHeroStart: "#004D22",
    loginHeroMid: "#00853F",
    loginHeroEnd: "#012818",
  },
  radius: 10,
};

export default colors;
