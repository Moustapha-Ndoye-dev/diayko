import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Section { title: string; body: string }
interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
}

const DOCS: Record<string, LegalDoc> = {
  cgu: {
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour : 1er mai 2026",
    intro: "Les présentes conditions régissent l'utilisation de Diayko, la marketplace de seconde main au Sénégal opérée par Diayko SAS.",
    sections: [
      { title: "1. Inscription", body: "L'inscription est gratuite et ouverte aux personnes majeures résidant au Sénégal. Vous garantissez la véracité des informations fournies." },
      { title: "2. Compte vendeur", body: "Pour publier des articles, vous devez soumettre une demande vendeur. Diayko se réserve le droit d'approuver ou refuser toute demande." },
      { title: "3. Articles autorisés", body: "Seuls les articles de mode de seconde main en bon état sont autorisés. Sont interdits : contrefaçons, articles dangereux, sous-vêtements." },
      { title: "4. Paiement et frais", body: "Diayko prélève 5% du prix de vente. Les paiements sont sécurisés et conservés jusqu'à confirmation de livraison." },
      { title: "5. Litiges", body: "En cas de litige, contactez le support sous 7 jours après réception. Diayko propose un remboursement intégral si l'article ne correspond pas." },
      { title: "6. Résiliation", body: "Vous pouvez fermer votre compte à tout moment depuis Paramètres. Diayko peut suspendre un compte en cas de violation de ces conditions." },
    ],
  },
  privacy: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 1er mai 2026",
    intro: "Diayko respecte votre vie privée. Nous collectons uniquement les données nécessaires au bon fonctionnement du service.",
    sections: [
      { title: "Données collectées", body: "Nom, e-mail, téléphone, ville, photos d'articles publiés, historique des achats et conversations." },
      { title: "Utilisation des données", body: "Vos données servent à : faciliter les transactions, vous notifier des commandes, prévenir la fraude, améliorer le service." },
      { title: "Partage", body: "Nous ne vendons jamais vos données. Le nom et la ville sont visibles publiquement. Le téléphone n'est jamais partagé sans votre accord." },
      { title: "Vos droits", body: "Vous pouvez accéder, modifier et supprimer vos données depuis Paramètres > Confidentialité. Téléchargement complet possible sur demande." },
      { title: "Sécurité", body: "Les données sont chiffrées en transit et au repos. Les paiements sont traités par nos partenaires certifiés." },
      { title: "Contact", body: "Pour toute question : privacy@diayko.sn" },
    ],
  },
  licenses: {
    title: "Licences open source",
    updated: "Diayko utilise plusieurs bibliothèques open source.",
    intro: "Nous remercions la communauté open source pour leur travail. Voici les principales bibliothèques utilisées :",
    sections: [
      { title: "React Native (MIT)", body: "Framework mobile maintenu par Meta. Copyright © Meta Platforms, Inc." },
      { title: "Expo (MIT)", body: "Plateforme universelle pour React Native. Copyright © 650 Industries, Inc." },
      { title: "React Query (MIT)", body: "Gestion d'état asynchrone. Copyright © Tanner Linsley." },
      { title: "react-native-svg (MIT)", body: "Rendu SVG natif." },
      { title: "Drizzle ORM (Apache-2.0)", body: "ORM TypeScript pour la base de données." },
      { title: "Inter (SIL OFL)", body: "Police de caractères par Rasmus Andersson." },
    ],
  },
};

export default function LegalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const doc = DOCS[slug ?? ""] ?? DOCS.cgu!;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingTop: topPad + 8, paddingBottom: 12, paddingHorizontal: 12,
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10,
    },
    backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
    title: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground },
    scroll: { padding: 16, paddingBottom: bottomPad + 32 },
    docTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.5 },
    updated: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 4, marginBottom: 16 },
    intro: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 21, marginBottom: 18 },
    section: { marginBottom: 18 },
    sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 6 },
    sectionBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 21 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>{doc.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.docTitle}>{doc.title}</Text>
        <Text style={styles.updated}>{doc.updated}</Text>
        <Text style={styles.intro}>{doc.intro}</Text>
        {doc.sections.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
