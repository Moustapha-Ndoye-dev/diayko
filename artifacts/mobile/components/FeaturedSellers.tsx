import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { StarRating } from "@/components/StarRating";
import { MOCK_USERS } from "@/data/mockData";

export function FeaturedSellers() {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: { marginBottom: 4 },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    label: {
      flex: 1,
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    seeAll: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    scroll: { paddingLeft: 16 },
    card: {
      width: 90,
      alignItems: "center",
      marginRight: 12,
      gap: 6,
    },
    avatarWrap: {
      position: "relative",
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2.5,
      borderColor: colors.primary,
    },
    avatarText: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    verifiedBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      textAlign: "center",
    },
    count: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  const AVATAR_COLORS = ["#09B1BA", "#6c5ce7", "#fd79a8", "#00b894", "#fdcb6e"];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Top Sellers</Text>
        <Text style={styles.seeAll}>See all</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {MOCK_USERS.map((user, i) => {
          const initials = user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
          return (
            <TouchableOpacity key={user.id} style={styles.card} activeOpacity={0.75}>
              <View style={styles.avatarWrap}>
                <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                {user.verified && (
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={10} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={styles.name} numberOfLines={1}>{user.name.split(" ")[0]}</Text>
              <Text style={styles.count}>{user.itemCount} items</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
