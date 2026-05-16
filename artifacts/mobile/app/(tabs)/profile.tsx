import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ItemCard } from "@/components/ItemCard";
import { StarRating } from "@/components/StarRating";
import { EmptyState } from "@/components/EmptyState";
import { Item } from "@/types";

type ProfileTab = "listings" | "favourites";

interface MenuItemProps {
  icon: string;
  label: string;
  badge?: string;
  onPress: () => void;
}

function MenuItem({ icon, label, badge, onPress }: MenuItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
      }}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Feather name={icon as any} size={18} color={colors.mutedForeground} />
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontFamily: "Inter_400Regular",
          color: colors.foreground,
        }}
      >
        {label}
      </Text>
      {badge ? (
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingHorizontal: 7,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Inter_700Bold",
              color: "#fff",
            }}
          >
            {badge}
          </Text>
        </View>
      ) : null}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentUser, items, favorites, myListings } = useApp();
  const [activeTab, setActiveTab] = useState<ProfileTab>("listings");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const displayItems =
    activeTab === "listings"
      ? items.filter((item) => item.seller.id === currentUser.id)
      : items.filter((item) => favorites.has(item.id));

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const pairs: [Item, Item | undefined][] = [];
  for (let i = 0; i < displayItems.length; i += 2) {
    pairs.push([displayItems[i]!, displayItems[i + 1]]);
  }

  const handleTabChange = useCallback((tab: ProfileTab) => {
    setActiveTab(tab);
  }, []);

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
    moreBtn: {
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
    nameBlock: { flex: 1, gap: 5 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    name: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
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
      lineHeight: 20,
    },
    divider: { height: 1, backgroundColor: colors.border },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
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
    menuSection: {
      backgroundColor: colors.card,
      marginTop: 10,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    tabRow: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginTop: 10,
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
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    grid: { padding: 12 },
    footer: { height: bottomPad + 16 },
  });

  const renderHeader = () => (
    <View>
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{currentUser.name}</Text>
              {currentUser.verified && (
                <Feather name="check-circle" size={16} color={colors.primary} />
              )}
            </View>
            <StarRating
              rating={currentUser.rating}
              count={currentUser.reviewCount}
              size={13}
            />
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {currentUser.bio ? (
          <Text style={styles.bio}>{currentUser.bio}</Text>
        ) : null}

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
        <MenuItem
          icon="package"
          label="My purchases"
          onPress={() => {}}
        />
        <MenuItem
          icon="truck"
          label="Shipments"
          onPress={() => {}}
        />
        <MenuItem
          icon="credit-card"
          label="Wallet"
          onPress={() => {}}
        />
        <MenuItem
          icon="bell"
          label="Notifications"
          badge="3"
          onPress={() => router.push("/notifications")}
        />
        <MenuItem
          icon="settings"
          label="Settings"
          onPress={() => router.push("/settings")}
        />
      </View>

      <View style={styles.tabRow}>
        {(["listings", "favourites"] as ProfileTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabBtn,
              {
                borderBottomColor:
                  activeTab === tab ? colors.primary : "transparent",
              },
            ]}
            onPress={() => handleTabChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
            accessibilityLabel={tab === "listings" ? "My listings" : "My favourites"}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab
                      ? colors.primary
                      : colors.mutedForeground,
                },
              ]}
            >
              {tab === "listings" ? "Listings" : "Favourites"}
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
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => router.push("/settings")}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Feather name="settings" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pairs}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item: [left, right] }) => (
          <View style={styles.row}>
            <ItemCard item={left} />
            {right ? (
              <ItemCard item={right} />
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === "listings" ? "shopping-bag" : "heart"}
            title={
              activeTab === "listings"
                ? "No listings yet"
                : "No favourites yet"
            }
            description={
              activeTab === "listings"
                ? "Tap the Sell tab to list your first item."
                : "Heart items you like to save them here."
            }
          />
        }
        ListFooterComponent={<View style={styles.footer} />}
      />
    </View>
  );
}
