import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  ListRenderItemInfo,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { storage } from "@/lib/storage";
import { INTERESTS } from "@/data/interests";

const { width, height } = Dimensions.get("window");
const BRAND = "#09B1BA";

interface Slide {
  id: string;
  accentColor: string;
  image: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: "discover",
    accentColor: "#09B1BA",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80",
    title: "Discover unique fashion",
    subtitle:
      "Browse thousands of pre-loved pieces from sellers near you. Find styles you love at a fraction of the price.",
  },
  {
    id: "sell",
    accentColor: "#6c5ce7",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80",
    title: "List items in minutes",
    subtitle:
      "Snap a photo, set your price, post. Reach thousands of buyers and turn your closet into cash.",
  },
  {
    id: "trust",
    accentColor: "#00b894",
    image:
      "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=900&q=80",
    title: "Safe & secure payments",
    subtitle:
      "Every transaction is protected. Pay safely, ship with confidence, get buyer protection on every order.",
  },
];

type Step = "intro" | "interests";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [step, setStep] = useState<Step>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const topPad = Platform.OS === "web" ? 8 : insets.top;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const finish = useCallback(
    async (interests: string[]) => {
      await Promise.all([
        storage.onboarding.setComplete(),
        storage.interests.set(interests),
      ]);
      router.replace("/(tabs)");
    },
    [router]
  );

  const handleSkip = useCallback(() => {
    finish([]);
  }, [finish]);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStep("interests");
    }
  }, [currentIndex]);

  const toggleInterest = useCallback((id: string) => {
    Haptics.selectionAsync();
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleConfirmInterests = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    finish(selectedInterests);
  }, [finish, selectedInterests]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const isLast = currentIndex === SLIDES.length - 1;
  const accent = SLIDES[currentIndex]?.accentColor ?? BRAND;

  // ---------------------------------------------------------------- interests
  if (step === "interests") {
    const tileSize = (width - 16 * 2 - 12 * 2) / 3;
    return (
      <View style={styles.container}>
        <View style={[styles.headerRow, { paddingTop: topPad + 12 }]}>
          <TouchableOpacity
            onPress={() => setStep("intro")}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.logo}>vinted</Text>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipBtn}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={[styles.skipText, { color: BRAND }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.interestsScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.interestsHeader}>
            <Text style={styles.interestsTitle}>What are you into?</Text>
            <Text style={styles.interestsSubtitle}>
              Pick a few topics so we can personalise your feed. You can change
              this later in settings.
            </Text>
          </View>

          <View style={styles.tileGrid}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.tile,
                    { width: tileSize, height: tileSize * 1.15 },
                    isSelected && styles.tileSelected,
                  ]}
                  onPress={() => toggleInterest(interest.id)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`${interest.label}${isSelected ? ", selected" : ""}`}
                >
                  <Image
                    source={{ uri: interest.image }}
                    style={styles.tileImage}
                    resizeMode="cover"
                    accessibilityLabel={`${interest.label} category`}
                  />
                  <View
                    style={[
                      styles.tileOverlay,
                      isSelected && { backgroundColor: "rgba(9,177,186,0.55)" },
                    ]}
                  />
                  <Text style={styles.tileLabel}>{interest.label}</Text>
                  {isSelected && (
                    <View style={styles.tileCheck}>
                      <Feather name="check" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: bottomPad }]}>
          <Text style={styles.selectionCount}>
            {selectedInterests.length === 0
              ? "Pick at least one to personalise (optional)"
              : `${selectedInterests.length} selected`}
          </Text>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: BRAND }]}
            onPress={handleConfirmInterests}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text style={styles.nextBtnText}>Get started</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---------------------------------------------------------------- intro
  const renderSlide = ({ item }: ListRenderItemInfo<Slide>) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.slideImageWrap}>
        <Image
          source={{ uri: item.image }}
          style={styles.slideImage}
          resizeMode="cover"
          accessibilityLabel={item.title}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.05)", "#ffffff"]}
          locations={[0, 0.6, 1]}
          style={styles.slideGradient}
        />
        <View style={[styles.accentChip, { backgroundColor: item.accentColor }]}>
          <View style={styles.accentChipDot} />
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
        <View style={{ width: 36 }} />
        <Text style={[styles.logo, { color: accent }]}>vinted</Text>
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
          accessibilityLabel={isLast ? "Choose your interests" : "Next slide"}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? "Choose your interests" : "Continue"}
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
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
  },
  logo: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    color: BRAND,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 50,
    alignItems: "flex-end",
  },
  skipText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  // intro slides
  slide: {
    flex: 1,
  },
  slideImageWrap: {
    height: height * 0.5,
    position: "relative",
    overflow: "hidden",
  },
  slideImage: {
    width: "100%",
    height: "100%",
  },
  slideGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
  },
  accentChip: {
    position: "absolute",
    bottom: 28,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  accentChipDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
  },
  slideBottom: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    gap: 14,
  },
  slideTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#1a1a1a",
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#666",
    lineHeight: 25,
  },
  // footer (shared)
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 18,
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
  // interests
  interestsScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  interestsHeader: {
    paddingHorizontal: 4,
    paddingBottom: 18,
    gap: 8,
  },
  interestsTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  interestsSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#666",
    lineHeight: 22,
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eee",
    position: "relative",
  },
  tileSelected: {
    borderWidth: 3,
    borderColor: BRAND,
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.30)",
  },
  tileLabel: {
    position: "absolute",
    left: 10,
    bottom: 10,
    right: 10,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  tileCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  selectionCount: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#888",
    textAlign: "center",
  },
});
