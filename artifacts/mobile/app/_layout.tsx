import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/lib/auth";
import { storage } from "@/lib/storage";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [onboardingChecked, setOnboardingChecked] = React.useState(false);
  const [onboardingComplete, setOnboardingComplete] = React.useState(false);

  useEffect(() => {
    storage.onboarding.isComplete().then((complete) => {
      setOnboardingComplete(complete);
      setOnboardingChecked(true);
    });
  }, [segments[0]]);

  useEffect(() => {
    if (isLoading || !onboardingChecked) return;

    const currentRoute = segments[0] as string | undefined;
    const inAuthGroup = currentRoute === "login";
    const inOnboarding = currentRoute === "onboarding";

    if (!onboardingComplete && !inOnboarding) {
      router.replace("/onboarding");
    } else if (onboardingComplete && !isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, onboardingChecked, onboardingComplete, segments, router]);

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ gestureEnabled: false, animation: "fade" }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="onboarding"
        options={{ gestureEnabled: false, animation: "fade" }}
      />
      <Stack.Screen
        name="item/[id]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="conversation/[id]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="seller/[id]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="settings"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen name="favorites" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="deliveries" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="edit-profile" options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="help" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="seller-stats" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="promotion/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="legal/[slug]" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthGuard>
              <AppProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardProvider>
                    <RootLayoutNav />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </AppProvider>
            </AuthGuard>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
