import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  ListRenderItemInfo,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { storage } from "@/lib/storage";

const { width, height } = Dimensions.get("window");

interface Slide {
  id: string;
  accentColor: string;
  icon: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: "discover",
    accentColor: "#09B1BA",
    icon: "search",
    title: "Discover unique fashion",
    subtitle:
      "Browse thousands of pre-loved pieces from sellers near you. Find the style you love at a fraction of the price.",
  },
  {
    id: "sell",
    accentColor: "#6c5ce7",
    icon: "camera",
    title: "List items in minutes",
    subtitle:
      "Take a photo, set your price, and you're done. Reach thousands of buyers instantly and earn from your wardrobe.",
  },
  {
    id: "trust",
    accentColor: "#00b894",
    icon: "shield",
    title: "Safe & secure payments",
    subtitle:
      "Every transaction is protected. Pay safely, ship with confidence, and get buyer protection on every purchase.",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const handleComplete = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await storage.onboarding.setComplete();
    router.replace("/(tabs)");
  }, [router]);

  const handleSkip = useCallback(async () => {
    await storage.onboarding.setComplete();
    router.replace("/(tabs)");
  }, [router]);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleComplete();
    }
  }, [currentIndex, handleComplete]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const isLast = currentIndex === SLIDES.length - 1;
  const accent = SLIDES[currentIndex]?.accentColor ?? "#09B1BA";

  const renderSlide = ({ item }: ListRenderItemInfo<Slide>) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.slideTop, { backgroundColor: item.accentColor }]}>
        <View style={styles.iconCircle}>
          <Feather name={item.icon as any} size={52} color={item.accentColor} />
        </View>
      </View>
      <View style={styles.slideBottom}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, { paddingTop: topPad + 12 }]}>
        <View style={[styles.wordmark]}>
          <Text style={[styles.logo, { color: accent }]}>vinted</Text>
        </View>
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipBtn}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={[styles.skipText, { color: accent }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View style={[styles.footer, { paddingBottom: bottomPad }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: currentIndex === i ? 24 : 8,
                  backgroundColor: currentIndex === i ? accent : "#ddd",
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: accent }]}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Get started" : "Next slide"}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? "Get started" : "Continue"}
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 8,
    zIndex: 10,
  },
  wordmark: {},
  logo: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  slide: {
    flex: 1,
  },
  slideTop: {
    height: height * 0.45,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  slideBottom: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    gap: 14,
  },
  slideTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#1a1a1a",
    lineHeight: 36,
  },
  slideSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#666",
    lineHeight: 25,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 24,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
