import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { storage } from "@/lib/storage";

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  destructive?: boolean;
  rightElement?: React.ReactNode;
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  destructive = false,
  rightElement,
}: SettingsItemProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 13,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
      gap: 12,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: destructive ? colors.destructive : colors.foreground,
    },
    value: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginRight: 4,
    },
  });

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessibilityRole={onPress ? "button" : "none"}
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: destructive
              ? `${colors.destructive}14`
              : colors.secondary,
          },
        ]}
      >
        <Feather
          name={icon as any}
          size={16}
          color={destructive ? colors.destructive : colors.mutedForeground}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {rightElement}
      {showArrow && onPress && !rightElement ? (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      ) : null}
    </TouchableOpacity>
  );
}

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  const colors = useColors();
  return (
    <Text
      style={{
        fontSize: 12,
        fontFamily: "Inter_600SemiBold",
        color: colors.mutedForeground,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
      }}
    >
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const comingSoon = (label?: string) =>
    Alert.alert(
      label ?? "Bientôt disponible",
      "Cette fonctionnalité sera disponible dans une prochaine mise à jour.",
      [{ text: "OK" }]
    );

  const handleLogOut = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await storage.onboarding.reset();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: topPad + 8,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    sectionBorder: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    version: {
      textAlign: "center",
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      paddingTop: 24,
      paddingBottom: bottomPad + 24,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="Compte" />
        <View style={styles.sectionBorder}>
          <SettingsItem
            icon="user"
            label="Modifier le profil"
            onPress={() => router.push("/edit-profile")}
          />
          <SettingsItem
            icon="mail"
            label="Adresse e-mail"
            value="sophie@example.com"
            onPress={() =>
              Alert.alert("Adresse e-mail", "Pour modifier votre e-mail, contactez le support Diayko.", [{ text: "OK" }])
            }
          />
          <SettingsItem
            icon="lock"
            label="Changer le mot de passe"
            onPress={() =>
              Alert.alert("Changer le mot de passe", "Un lien de réinitialisation sera envoyé à votre adresse e-mail.", [
                { text: "Annuler", style: "cancel" },
                { text: "Envoyer le lien", onPress: () => Alert.alert("Lien envoyé", "Vérifiez votre boîte e-mail.") },
              ])
            }
          />
          <SettingsItem
            icon="credit-card"
            label="Moyens de paiement"
            onPress={() => router.push("/wallet")}
          />
          <SettingsItem
            icon="map-pin"
            label="Adresse de livraison"
            onPress={() =>
              Alert.alert("Adresse de livraison", "Dakar, Sénégal\nMermoz, Villa 42", [
                { text: "Modifier", onPress: () => comingSoon("Modification d'adresse") },
                { text: "OK" },
              ])
            }
          />
        </View>

        <SectionHeader title="Notifications" />
        <View style={styles.sectionBorder}>
          <SettingsItem
            icon="bell"
            label="Notifications push"
            showArrow={false}
            rightElement={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ true: colors.primary }}
                accessibilityLabel="Activer les notifications push"
              />
            }
          />
          <SettingsItem
            icon="mail"
            label="Notifications par e-mail"
            showArrow={false}
            rightElement={
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ true: colors.primary }}
                accessibilityLabel="Activer les notifications par e-mail"
              />
            }
          />
          <SettingsItem
            icon="message-square"
            label="Notifications SMS"
            showArrow={false}
            rightElement={
              <Switch
                value={smsEnabled}
                onValueChange={setSmsEnabled}
                trackColor={{ true: colors.primary }}
                accessibilityLabel="Activer les notifications SMS"
              />
            }
          />
        </View>

        <SectionHeader title="Confidentialité" />
        <View style={styles.sectionBorder}>
          <SettingsItem
            icon="eye"
            label="Visibilité du profil"
            value="Publique"
            onPress={() =>
              Alert.alert("Visibilité du profil", "Votre profil est actuellement public.", [
                { text: "Rendre privé", onPress: () => comingSoon("Profil privé") },
                { text: "OK" },
              ])
            }
          />
          <SettingsItem icon="shield" label="Données et confidentialité" onPress={() => comingSoon()} />
          <SettingsItem
            icon="download"
            label="Télécharger mes données"
            onPress={() =>
              Alert.alert("Téléchargement", "Votre demande sera traitée sous 48h et envoyée par e-mail.", [
                { text: "Annuler", style: "cancel" },
                { text: "Confirmer", onPress: () => Alert.alert("Demande enregistrée", "Vous recevrez vos données par e-mail sous 48h.") },
              ])
            }
          />
        </View>

        <SectionHeader title="Support" />
        <View style={styles.sectionBorder}>
          <SettingsItem
            icon="help-circle"
            label="Centre d'aide"
            onPress={() => router.push("/help")}
          />
          <SettingsItem
            icon="message-circle"
            label="Contacter le support"
            onPress={() => router.push("/help")}
          />
          <SettingsItem
            icon="flag"
            label="Signaler un problème"
            onPress={() =>
              Alert.alert("Signaler un problème", "Décrivez le problème rencontré pour que notre équipe puisse l'examiner.", [
                { text: "Annuler", style: "cancel" },
                { text: "Signaler", onPress: () => Alert.alert("Signalement envoyé", "Merci, notre équipe examinera votre rapport sous 24h.") },
              ])
            }
          />
        </View>

        <SectionHeader title="À propos" />
        <View style={styles.sectionBorder}>
          <SettingsItem
            icon="file-text"
            label="Conditions d'utilisation"
            onPress={() => router.push("/legal/cgu")}
          />
          <SettingsItem
            icon="shield"
            label="Politique de confidentialité"
            onPress={() => router.push("/legal/privacy")}
          />
          <SettingsItem icon="info" label="Licences open source" onPress={() => router.push("/legal/licenses")} />
        </View>

        <SectionHeader title="Actions du compte" />
        <View style={styles.sectionBorder}>
          <SettingsItem
            icon="log-out"
            label="Se déconnecter"
            destructive
            showArrow={false}
            onPress={handleLogOut}
          />
        </View>

        <Text style={styles.version}>Diayko · Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}
