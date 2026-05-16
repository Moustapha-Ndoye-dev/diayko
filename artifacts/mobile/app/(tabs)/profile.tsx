import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ItemCard } from "@/components/ItemCard";
import { StarRating } from "@/components/StarRating";

type Tab = "listings" | "favorites";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, items, favorites, myListings } = useApp();
  const [tab, setTab] = useState<Tab>("listings");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const displayItems =
    tab === "listings"
      ? items.filter((i) => i.seller.id === currentUser.id)
      : items.filter((i) => favorites.includes(i.id));

  const initials = currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 12,
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    settingsBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    profileCard: {
      backgroundColor: colors.card,
      padding: 20,
      gap: 14,
    },
    avatarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    nameBlock: { flex: 1, gap: 4 },
    name: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    verifiedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    verifiedText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    editBtn: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    editBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    bio: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 4,
    },
    stat: { alignItems: "center", gap: 2 },
    statValue: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
    tabRow: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 13,
      alignItems: "center",
      borderBottomWidth: 2,
    },
    tabText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    grid: { padding: 12 },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    empty: {
      alignItems: "center",
      paddingVertical: 60,
      gap: 12,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    bottomPad: { height: bottomPad },
    menuSection: {
      backgroundColor: colors.card,
      marginTop: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    menuLabel: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
  });

  const pairs: any[] = [];
  for (let i = 0; i < displayItems.length; i += 2) {
    pairs.push([displayItems[i], displayItems[i + 1]]);
  }

  const renderHeader = () => (
    <View>
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.name}>{currentUser.name}</Text>
            {currentUser.verified && (
              <View style={styles.verifiedRow}>
                <Feather name="check-circle" size={13} color={colors.primary} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
            <StarRating rating={currentUser.rating} count={currentUser.reviewCount} size={13} />
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {currentUser.bio && (
          <Text style={styles.bio}>{currentUser.bio}</Text>
        )}

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{currentUser.itemCount}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{currentUser.followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{currentUser.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        {[
          { icon: "package", label: "My purchases" },
          { icon: "truck", label: "Shipments" },
          { icon: "credit-card", label: "Wallet" },
          { icon: "settings", label: "Settings" },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7}>
            <Feather name={item.icon as any} size={18} color={colors.mutedForeground} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabRow}>
        {(["listings", "favorites"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tabBtn,
              {
                borderBottomColor: tab === t ? colors.primary : "transparent",
              },
            ]}
            onPress={() => setTab(t)}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === t ? colors.primary : colors.mutedForeground },
              ]}
            >
              {t === "listings" ? "Listings" : "Favourites"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My profile</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Feather name="more-horizontal" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={pairs}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ItemCard item={item[0]} />
            {item[1] ? <ItemCard item={item[1]} /> : <View style={{ flex: 1 }} />}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather
              name={tab === "listings" ? "shopping-bag" : "heart"}
              size={48}
              color={colors.border}
            />
            <Text style={styles.emptyText}>
              {tab === "listings" ? "No listings yet" : "No favourites yet"}
            </Text>
          </View>
        }
        ListFooterComponent={<View style={styles.bottomPad} />}
      />
    </View>
  );
}
