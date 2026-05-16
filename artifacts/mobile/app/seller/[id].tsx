import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAsyncState } from "@/hooks/useAsyncState";
import { api } from "@/lib/api";
import { ItemCard } from "@/components/ItemCard";
import { StarRating } from "@/components/StarRating";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { Item, Seller, AsyncState } from "@/types";
import { toItem, toSeller } from "@/context/AppContext";

export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [sellerState] = useAsyncState<Seller>(
    async () => {
      const u = await api.users.get(id ?? "");
      return toSeller(u);
    },
    [id]
  );

  const [itemsState] = useAsyncState<Item[]>(
    async () => {
      const res = await api.users.items(id ?? "");
      return res.items.map(toItem);
    },
    [id]
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: topPad + 8,
      paddingBottom: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 8,
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
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "center",
    },
    headerSpacer: { width: 38 },
    profileCard: {
      backgroundColor: colors.card,
      padding: 20,
      alignItems: "center",
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 30,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    verifiedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    name: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    verifiedText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    bio: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 20,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      paddingTop: 8,
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
    actionsRow: {
      flexDirection: "row",
      gap: 10,
      paddingTop: 4,
    },
    followBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 10,
      alignItems: "center",
    },
    followBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
    messageBtn: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 10,
      alignItems: "center",
    },
    messageBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    grid: { padding: 12 },
    footer: { height: bottomPad + 16 },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    joinedText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
  });

  const AVATAR_COLORS = [
    "#09B1BA",
    "#6c5ce7",
    "#fd79a8",
    "#00b894",
    "#fdcb6e",
  ];
  const colorIndex =
    (id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  const avatarColor = AVATAR_COLORS[colorIndex];

  const seller =
    sellerState.status === "success" ? sellerState.data : null;
  const items =
    itemsState.status === "success" ? itemsState.data : [];
  const initials = seller
    ? seller.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  const pairs: Item[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push([items[i], items[i + 1]].filter(Boolean) as Item[]);
  }

  const renderHeader = () => (
    <View>
      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {sellerState.status === "loading" ? (
          <ActivityIndicator color={colors.primary} />
        ) : sellerState.status === "success" ? (
          <>
            <View style={styles.verifiedRow}>
              <Text style={styles.name}>{seller!.name}</Text>
              {seller!.verified && (
                <Feather
                  name="check-circle"
                  size={16}
                  color={colors.primary}
                />
              )}
            </View>
            <StarRating
              rating={seller!.rating}
              count={seller!.reviewCount}
              size={14}
            />
            {seller!.bio ? (
              <Text style={styles.bio}>{seller!.bio}</Text>
            ) : null}
            <Text style={styles.joinedText}>
              Member since {seller!.joinedAt.slice(0, 4)}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{seller!.itemCount}</Text>
                <Text style={styles.statLabel}>Items</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{seller!.followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{seller!.reviewCount}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.followBtn}
                accessibilityRole="button"
                accessibilityLabel={`Follow ${seller!.name}`}
              >
                <Text style={styles.followBtnText}>Follow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageBtn}
                accessibilityRole="button"
                accessibilityLabel={`Message ${seller!.name}`}
              >
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>
        {itemsState.status === "success"
          ? `${items.length} item${items.length !== 1 ? "s" : ""}`
          : "Items"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {seller?.name ?? "Seller profile"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {itemsState.status === "loading" ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={<SkeletonGrid />}
        />
      ) : (
        <FlatList
          data={pairs}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <ItemCard item={item[0]!} />
              {item[1] ? <ItemCard item={item[1]} /> : <View style={{ flex: 1 }} />}
            </View>
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            itemsState.status === "error" ? (
              <EmptyState
                icon="alert-circle"
                title="Failed to load items"
                description={itemsState.message}
                actionLabel="Retry"
                onAction={() => {}}
              />
            ) : (
              <EmptyState
                icon="shopping-bag"
                title="No items listed"
                description="This seller hasn't listed any items yet."
              />
            )
          }
          ListFooterComponent={<View style={styles.footer} />}
        />
      )}
    </View>
  );
}
