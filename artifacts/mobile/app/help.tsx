import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface FAQ { q: string; a: string }

const FAQS: FAQ[] = [
  { q: "Comment acheter un article ?", a: "Trouvez un article qui vous plaît, appuyez sur \"Acheter\" et choisissez votre moyen de paiement (Wave, Orange Money, Free Money). Le paiement est sécurisé par Diayko jusqu'à la livraison." },
  { q: "Quand puis-je devenir vendeur ?", a: "Demandez l'accès vendeur depuis votre profil. Notre équipe valide votre demande sous 24h en semaine. Une fois approuvé, l'onglet \"Vendre\" apparaît." },
  { q: "Comment se passe la livraison ?", a: "Le vendeur expédie via Wave Express, DHL Sénégal ou Sahel Logistique. Vous suivez votre commande en temps réel dans \"Mes livraisons\"." },
  { q: "Que faire si je ne reçois pas mon article ?", a: "Votre paiement est conservé par Diayko jusqu'à confirmation de livraison. Contactez le support si l'article n'arrive pas — vous serez remboursé intégralement." },
  { q: "Comment retirer mes gains de vente ?", a: "Allez dans \"Portefeuille\" et appuyez sur \"Retirer\". Choisissez votre compte Wave ou Orange Money. Les fonds arrivent sous 24h." },
  { q: "Les frais de service Diayko", a: "Diayko prélève 5% du prix de vente pour couvrir les frais de paiement et la protection acheteur. Aucun frais pour publier une annonce." },
];

export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

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
    section: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
    sectionTitle: { fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" },
    contactRow: {
      flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingBottom: 8,
    },
    contactCard: {
      flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 14, gap: 6, alignItems: "flex-start",
    },
    contactIcon: {
      width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    },
    contactLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    contactValue: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    faqList: { marginHorizontal: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: "hidden" },
    faqItem: { paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    faqItemLast: { borderBottomWidth: 0 },
    faqQuestionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    faqQuestion: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    faqAnswer: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 8, lineHeight: 19 },
    hoursCard: {
      marginHorizontal: 16, marginTop: 8,
      backgroundColor: colors.accent, borderRadius: 12, padding: 14, gap: 4,
    },
    hoursTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary },
    hoursText: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.primary },
    footer: { height: bottomPad + 24 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Centre d'aide</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nous contacter</Text>
        </View>
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.75}
            onPress={() => Linking.openURL("mailto:support@diayko.sn")}
          >
            <View style={[styles.contactIcon, { backgroundColor: colors.accent }]}>
              <Feather name="mail" size={18} color={colors.primary} />
            </View>
            <Text style={styles.contactLabel}>E-mail</Text>
            <Text style={styles.contactValue}>support@diayko.sn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.75}
            onPress={() => Linking.openURL("https://wa.me/221770000000")}
          >
            <View style={[styles.contactIcon, { backgroundColor: "#25D36633" }]}>
              <Feather name="message-circle" size={18} color="#25D366" />
            </View>
            <Text style={styles.contactLabel}>WhatsApp</Text>
            <Text style={styles.contactValue}>+221 77 000 00 00</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hoursCard}>
          <Text style={styles.hoursTitle}>Horaires du support</Text>
          <Text style={styles.hoursText}>Lundi – samedi · 8h00 – 20h00</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        </View>
        <View style={styles.faqList}>
          {FAQS.map((faq, i) => {
            const open = openIdx === i;
            const isLast = i === FAQS.length - 1;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.faqItem, isLast && styles.faqItemLast]}
                activeOpacity={0.7}
                onPress={() => setOpenIdx(open ? null : i)}
                accessibilityRole="button"
                accessibilityLabel={faq.q}
              >
                <View style={styles.faqQuestionRow}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
                </View>
                {open && <Text style={styles.faqAnswer}>{faq.a}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}
