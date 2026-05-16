import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import colors from "@/constants/colors";

const PRIMARY = colors.light.tint;

export default function LoginScreen() {
  const { login, isLoading, isAuthenticated, logout, user } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && router.canGoBack()) router.back();
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenue sur Diayko</Text>
        <Text style={styles.subtitle}>
          Connecte-toi pour acheter, vendre et discuter en toute sécurité.
        </Text>

        {isLoading ? (
          <ActivityIndicator color={PRIMARY} />
        ) : isAuthenticated ? (
          <View style={{ alignItems: "center", gap: 12 }}>
            <Text style={styles.body}>
              Connecté en tant que {user?.email ?? user?.firstName ?? "Utilisateur"}
            </Text>
            <Pressable style={styles.secondaryBtn} onPress={() => logout()}>
              <Text style={styles.secondaryBtnText}>Se déconnecter</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              login();
            }}
          >
            <Text style={styles.primaryBtnText}>Se connecter</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 20,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#111", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#555", textAlign: "center", marginBottom: 16 },
  body: { fontSize: 16, color: "#333" },
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  secondaryBtnText: { color: "#333", fontWeight: "600" },
});
