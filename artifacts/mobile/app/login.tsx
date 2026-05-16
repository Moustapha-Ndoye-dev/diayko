import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import Colors from "@/constants/colors";

const PRIMARY = Colors.light.primary;

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [pending, setPending] = React.useState(false);

  async function handleLogin() {
    setPending(true);
    try {
      await login();
    } finally {
      setPending(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Bienvenue sur Diayko</Text>
        <Text style={styles.subtitle}>
          La marketplace de la mode de seconde main
        </Text>

        <TouchableOpacity
          style={[styles.button, pending && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={pending}
          activeOpacity={0.85}
        >
          {pending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.legal}>
          En continuant, vous acceptez nos Conditions d'utilisation et notre
          Politique de confidentialité.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    width: "100%",
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  legal: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
