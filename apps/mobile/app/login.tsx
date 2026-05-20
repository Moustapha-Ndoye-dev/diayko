import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { Router } from "expo-router";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DiaykoLogo } from "@/components/DiaykoLogo";
import { useColors } from "@/hooks/useColors";
import { ApiHttpError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Palette = ReturnType<typeof useColors>;
type AuthMode = "login" | "signup";
type IconName = keyof typeof Feather.glyphMap;

const HERO_IMAGE = require("../assets/images/login_seller.png");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function parseApiFeedback(error: unknown): string {
  if (!(error instanceof ApiHttpError)) {
    return "Connexion indisponible. Verifie le reseau puis reessaie.";
  }

  try {
    const parsed = JSON.parse(error.bodyText) as { error?: string; message?: string };
    if (parsed.error) return translatedError(parsed.error);
    if (parsed.message) return parsed.message;
  } catch {
    // The API can return plain text for unexpected errors.
  }

  return error.bodyText.trim() ? error.bodyText.slice(0, 200) : error.message;
}

function translatedError(raw: string): string {
  const lowered = raw.toLowerCase();
  if (lowered.includes("invalid email or password")) return "E-mail ou mot de passe invalide.";
  if (lowered.includes("email already registered")) return "Cette adresse e-mail est deja utilisee.";
  return raw;
}

function loginScreenStyles(colors: Palette, topPad: number, bottomPad: number) {
  const heroHeight = Math.min(Math.max(SCREEN_HEIGHT * 0.47, 330), 440);

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardRoot: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: bottomPad,
      backgroundColor: colors.background,
    },
    hero: {
      height: heroHeight,
      overflow: "hidden",
      backgroundColor: colors.loginHeroEnd,
    },
    heroImage: {
      transform: [{ translateY: 18 }],
    },
    heroScrim: {
      ...StyleSheet.absoluteFillObject,
    },
    topBar: {
      position: "absolute",
      left: 18,
      right: 18,
      top: topPad + 10,
      zIndex: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.20)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.28)",
    },
    brandPill: {
      height: 48,
      borderRadius: 24,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.28)",
    },
    localePill: {
      height: 42,
      borderRadius: 21,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.28)",
    },
    flag: {
      width: 26,
      height: 18,
      borderRadius: 4,
      overflow: "hidden",
      flexDirection: "row",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.35)",
    },
    flagStripe: {
      flex: 1,
    },
    localeText: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: "#FFFFFF",
    },
    heroCopy: {
      position: "absolute",
      left: 24,
      right: 24,
      bottom: 56,
      zIndex: 3,
      gap: 12,
    },
    eyebrow: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: "rgba(0,133,63,0.28)",
      color: "#B8FFD2",
      fontFamily: "Inter_700Bold",
      fontSize: 12,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    heroTitle: {
      maxWidth: 330,
      fontFamily: "Inter_700Bold",
      fontSize: 40,
      lineHeight: 45,
      color: "#FFFFFF",
      letterSpacing: -0.4,
    },
    sheetWrap: {
      marginTop: -36,
      paddingHorizontal: 16,
      zIndex: 5,
    },
    sheet: {
      alignSelf: "center",
      width: "100%",
      maxWidth: 440,
      borderRadius: 28,
      backgroundColor: colors.card,
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(26,30,26,0.08)",
      ...Platform.select({
        ios: {
          shadowColor: "#0B2B19",
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.15,
          shadowRadius: 30,
        },
        android: { elevation: 14 },
        default: {},
      }),
    },
    dragHandle: {
      alignSelf: "center",
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: 16,
    },
    sheetTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 26,
      lineHeight: 32,
      color: colors.foreground,
      letterSpacing: -0.2,
      textAlign: "center",
    },
    sheetSubtitle: {
      alignSelf: "center",
      maxWidth: 300,
      marginTop: 7,
      marginBottom: 18,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      lineHeight: 21,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    modeRow: {
      flexDirection: "row",
      borderRadius: 16,
      backgroundColor: colors.secondary,
      padding: 4,
      marginBottom: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    modeButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    modeButtonActive: {
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(0,133,63,0.24)",
    },
    modeText: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: colors.mutedForeground,
    },
    modeTextActive: {
      color: colors.primary,
    },
    namesRow: {
      flexDirection: "row",
      gap: 10,
    },
    namesCol: {
      flex: 1,
    },
    fieldLabel: {
      marginLeft: 2,
      marginBottom: 7,
      fontFamily: "Inter_700Bold",
      fontSize: 12,
      color: colors.foreground,
    },
    inputBox: {
      minHeight: 54,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "#FFFDF8",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      marginBottom: 14,
      gap: 10,
    },
    inputBoxFocused: {
      borderColor: colors.primary,
      backgroundColor: "#FFFFFF",
    },
    input: {
      flex: 1,
      paddingVertical: Platform.OS === "ios" ? 14 : 10,
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.foreground,
    },
    iconMuted: {
      opacity: 0.82,
    },
    iconButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    feedback: {
      marginBottom: 14,
      borderRadius: 15,
      paddingHorizontal: 13,
      paddingVertical: 11,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      backgroundColor: "rgba(200,75,28,0.10)",
      borderWidth: 1,
      borderColor: "rgba(200,75,28,0.22)",
    },
    feedbackText: {
      flex: 1,
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      lineHeight: 18,
      color: colors.destructive,
    },
    submitButton: {
      marginTop: 2,
      minHeight: 58,
      borderRadius: 18,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 18,
        },
        android: { elevation: 9 },
        default: {},
      }),
    },
    submitGradient: {
      flex: 1,
      minHeight: 58,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    submitText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: colors.primaryForeground,
    },
    mutedAction: {
      alignSelf: "center",
      marginTop: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    mutedActionText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.mutedForeground,
    },
    mutedActionAccent: {
      color: colors.primary,
    },
    trustRow: {
      alignSelf: "center",
      maxWidth: 440,
      marginTop: 16,
      paddingHorizontal: 18,
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
    },
    trustItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    trustText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    legal: {
      alignSelf: "center",
      maxWidth: 360,
      paddingHorizontal: 28,
      marginTop: 14,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      lineHeight: 18,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    legalLink: {
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    disabled: {
      opacity: 0.55,
    },
    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      backgroundColor: colors.background,
    },
    loadingText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.mutedForeground,
    },
  });
}

type Styles = ReturnType<typeof loginScreenStyles>;

function SenegalFlag(props: Readonly<{ styles: Styles }>) {
  const { styles } = props;
  return (
    <View style={styles.flag}>
      <View style={[styles.flagStripe, { backgroundColor: "#00853F" }]} />
      <View style={[styles.flagStripe, { backgroundColor: "#F5C518" }]} />
      <View style={[styles.flagStripe, { backgroundColor: "#E31B23" }]} />
    </View>
  );
}

function LoginTopBar(props: Readonly<{ router: Router; styles: Styles }>) {
  const { router, styles } = props;
  const canGoBack = router.canGoBack();

  return (
    <View style={styles.topBar}>
      {canGoBack ? (
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </Pressable>
      ) : (
        <View style={styles.brandPill}>
          <DiaykoLogo size={30} variant="full" wordmarkColor="#FFFFFF" />
        </View>
      )}

      <View style={styles.localePill}>
        <SenegalFlag styles={styles} />
        <Text style={styles.localeText}>FR</Text>
      </View>
    </View>
  );
}

function AuthField(
  props: Readonly<{
    colors: Palette;
    styles: Styles;
    label: string;
    icon: IconName;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    secure?: boolean;
    showSecure?: boolean;
    onToggleSecure?: () => void;
    keyboardType?: "default" | "email-address";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    textContentType?: "emailAddress" | "password" | "newPassword" | "name";
    editable: boolean;
  }>,
) {
  const {
    colors,
    styles,
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    secure = false,
    showSecure = false,
    onToggleSecure,
    keyboardType = "default",
    autoCapitalize = "sentences",
    textContentType,
    editable,
  } = props;
  const [focused, setFocused] = React.useState(false);

  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        <Feather name={icon} size={19} color={colors.primary} style={styles.iconMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          secureTextEntry={secure && !showSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          textContentType={textContentType}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {onToggleSecure ? (
          <Pressable
            style={styles.iconButton}
            onPress={onToggleSecure}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={showSecure ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            <Feather name={showSecure ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { login, signup, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = React.useState<AuthMode>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 12 : Math.max(insets.top, 8);
  const bottomPad = Platform.OS === "web" ? 28 : Math.max(insets.bottom, 18) + 10;
  const styles = React.useMemo(
    () => loginScreenStyles(colors, topPad, bottomPad),
    [colors, topPad, bottomPad],
  );

  const isSignup = mode === "signup";
  const submitLabel = isSignup ? "Creer mon compte" : "Se connecter";
  const subtitle = isSignup
    ? "Ouvre ton espace pour publier, discuter et suivre tes ventes."
    : "Retrouve tes favoris, messages et commandes en quelques secondes.";

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setFeedback(null);
  }

  async function handleSubmit() {
    Keyboard.dismiss();
    setFeedback(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes("@")) {
      setFeedback("Saisis une adresse e-mail valide.");
      return;
    }

    if (password.length < 8) {
      setFeedback("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }

    setBusy(true);
    try {
      if (isSignup) {
        await signup({
          email: trimmedEmail,
          password,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        });
      } else {
        await login(trimmedEmail, password);
      }
    } catch (err) {
      setFeedback(parseApiFeedback(err));
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparation de Diayko...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <ImageBackground
            source={HERO_IMAGE}
            style={styles.hero}
            imageStyle={styles.heroImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                "rgba(1,40,24,0.88)",
                "rgba(1,40,24,0.38)",
                "rgba(1,40,24,0.10)",
                "rgba(1,40,24,0.86)",
              ]}
              locations={[0, 0.32, 0.58, 1]}
              style={styles.heroScrim}
            />
            <LoginTopBar router={router} styles={styles} />
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Seconde main</Text>
              <Text style={styles.heroTitle}>Achetez. Vendez. Recommencez.</Text>
            </View>
          </ImageBackground>

          <View style={styles.sheetWrap}>
            <View style={styles.sheet}>
              <View style={styles.dragHandle} />
              <Text style={styles.sheetTitle}>{isSignup ? "Bienvenue sur Diayko" : "Bon retour"}</Text>
              <Text style={styles.sheetSubtitle}>{subtitle}</Text>

              <View style={styles.modeRow}>
                <Pressable
                  style={[styles.modeButton, !isSignup && styles.modeButtonActive]}
                  onPress={() => switchMode("login")}
                  accessibilityRole="button"
                  accessibilityLabel="Connexion"
                >
                  <Text style={[styles.modeText, !isSignup && styles.modeTextActive]}>Connexion</Text>
                </Pressable>
                <Pressable
                  style={[styles.modeButton, isSignup && styles.modeButtonActive]}
                  onPress={() => switchMode("signup")}
                  accessibilityRole="button"
                  accessibilityLabel="Inscription"
                >
                  <Text style={[styles.modeText, isSignup && styles.modeTextActive]}>Inscription</Text>
                </Pressable>
              </View>

              {feedback ? (
                <View style={styles.feedback} accessibilityLiveRegion="polite">
                  <Feather name="alert-circle" size={18} color={colors.destructive} />
                  <Text style={styles.feedbackText}>{feedback}</Text>
                </View>
              ) : null}

              {isSignup ? (
                <View style={styles.namesRow}>
                  <View style={styles.namesCol}>
                    <AuthField
                      colors={colors}
                      styles={styles}
                      label="Prenom"
                      icon="user"
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Awa"
                      autoCapitalize="words"
                      textContentType="name"
                      editable={!busy}
                    />
                  </View>
                  <View style={styles.namesCol}>
                    <AuthField
                      colors={colors}
                      styles={styles}
                      label="Nom"
                      icon="user"
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Diallo"
                      autoCapitalize="words"
                      textContentType="name"
                      editable={!busy}
                    />
                  </View>
                </View>
              ) : null}

              <AuthField
                colors={colors}
                styles={styles}
                label="E-mail"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                placeholder="toi@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
                editable={!busy}
              />

              <AuthField
                colors={colors}
                styles={styles}
                label="Mot de passe"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                placeholder="8 caracteres minimum"
                secure
                showSecure={showPassword}
                onToggleSecure={() => setShowPassword((current) => !current)}
                textContentType={isSignup ? "newPassword" : "password"}
                editable={!busy}
              />

              <TouchableOpacity
                style={[styles.submitButton, busy && styles.disabled]}
                onPress={handleSubmit}
                activeOpacity={0.92}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={submitLabel}
              >
                <LinearGradient
                  colors={[colors.loginHeroStart, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  {busy ? (
                    <ActivityIndicator color={colors.primaryForeground} />
                  ) : (
                    <>
                      <Text style={styles.submitText}>{submitLabel}</Text>
                      <Feather name="arrow-right" size={20} color={colors.primaryForeground} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Pressable
                style={styles.mutedAction}
                onPress={() => switchMode(isSignup ? "login" : "signup")}
                disabled={busy}
                accessibilityRole="button"
              >
                <Text style={styles.mutedActionText}>
                  {isSignup ? "Deja inscrit ?" : "Nouveau sur Diayko ?"}{" "}
                  <Text style={styles.mutedActionAccent}>
                    {isSignup ? "Se connecter" : "Creer un compte"}
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Feather name="shield" size={14} color={colors.primary} />
              <Text style={styles.trustText}>Verifie</Text>
            </View>
            <View style={styles.trustItem}>
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={styles.trustText}>Local</Text>
            </View>
            <View style={styles.trustItem}>
              <Feather name="credit-card" size={14} color={colors.primary} />
              <Text style={styles.trustText}>Simple</Text>
            </View>
          </View>

          <Text style={styles.legal}>
            En continuant, tu acceptes les{" "}
            <Text style={styles.legalLink} onPress={() => router.push("/legal/cgu")}>
              conditions
            </Text>{" "}
            et la{" "}
            <Text style={styles.legalLink} onPress={() => router.push("/legal/privacy")}>
              confidentialite
            </Text>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
