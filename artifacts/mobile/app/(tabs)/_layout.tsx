import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { ShopIcon, SearchIcon, SellIcon, InboxIcon, ProfileIcon } from "@/components/Icons";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { storage } from "@/lib/storage";

function ClassicTabLayout() {
  const colors = useColors();
  const router = useRouter();
  const { sellerStatus } = useApp();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  // Redirect to onboarding if not completed.
  useEffect(() => {
    storage.onboarding.isComplete().then((complete) => {
      if (!complete) {
        router.replace("/onboarding");
      }
    });
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      {/* 🛍 Accueil — shopping bag = marketplace à parcourir */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => <ShopIcon color={color} size={24} filled={focused} />,
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Recherche",
          tabBarIcon: ({ color, focused }) => <SearchIcon color={color} size={24} filled={focused} />,
        }}
      />

      <Tabs.Screen
        name="sell"
        options={{
          href: sellerStatus === "approved" ? undefined : null,
          title: "Vendre",
          tabBarIcon: ({ color, focused }) => <SellIcon color={color} size={24} filled={focused} />,
          // Double garde : masque complètement le bouton dans la barre si non approuvé.
          tabBarButton: sellerStatus === "approved" ? undefined : () => null,
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => <InboxIcon color={color} size={24} filled={focused} />,
          tabBarBadge: 3,
          tabBarBadgeStyle: { backgroundColor: colors.primary, fontSize: 11 },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => <ProfileIcon color={color} size={24} filled={focused} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return <ClassicTabLayout />;
}
