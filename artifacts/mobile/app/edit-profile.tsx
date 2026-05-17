import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentUser, updateProfile } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = async () => {
    if (isSaving) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Nom requis", "Veuillez saisir un nom complet.");
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ name: trimmedName, bio: bio.trim() || null });
      router.back();
    } catch {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingTop: topPad + 8, paddingBottom: 12, paddingHorizontal: 12,
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10,
    },
    backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
    title: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground },
    saveBtn: { paddingHorizontal: 14, paddingVertical: 8 },
    saveBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.primary },
    saveBtnDisabled: { opacity: 0.5 },
    scroll: { padding: 16, gap: 18 },
    avatarSection: { alignItems: "center", gap: 10, paddingVertical: 8 },
    avatar: {
      width: 96, height: 96, borderRadius: 48,
      backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    },
    avatarText: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#fff" },
    avatarBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
    avatarBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary },
    field: { gap: 6 },
    label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    input: {
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 10, paddingHorizontal: 14, paddingVertical: Platform.OS === "ios" ? 13 : 11,
      fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground,
    },
    textarea: { height: 96, textAlignVertical: "top" },
    counter: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "right" },
    footer: { height: bottomPad + 16 },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Modifier le profil</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Enregistrer"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          {currentUser.profileImageUrl ? (
            <Image
              source={{ uri: currentUser.profileImageUrl }}
              style={[styles.avatar, { backgroundColor: colors.secondary }]}
              accessibilityLabel="Photo de profil"
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "?"}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => Alert.alert("Bientôt disponible", "L'envoi de photo de profil arrivera prochainement.")}
          >
            <Feather name="camera" size={14} color={colors.primary} />
            <Text style={styles.avatarBtnText}>Modifier la photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            value={name} onChangeText={setName} style={styles.input}
            placeholder="Votre nom" placeholderTextColor={colors.mutedForeground}
            accessibilityLabel="Nom complet"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            value={bio} onChangeText={(t) => t.length <= 160 && setBio(t)}
            style={[styles.input, styles.textarea]}
            placeholder="Parlez de vous en quelques mots…" placeholderTextColor={colors.mutedForeground}
            multiline accessibilityLabel="Bio"
          />
          <Text style={styles.counter}>{bio.length} / 160</Text>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
