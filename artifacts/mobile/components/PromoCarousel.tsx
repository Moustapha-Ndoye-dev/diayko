import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = 160;

interface PromoSlide {
  id: string;
  type: "sale" | "boosted" | "brand" | "new";
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  image?: any;
  gradient: [string, string];
  cta: string;
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: "p1",
    type: "sale",
    title: "Summer Sale",
    subtitle: "Up to 70% off on selected items",
    badge: "🔥 HOT DEALS",
    badgeColor: "#ff6b35",
    image: require("../assets/images/promo1.png"),
    gradient: ["#09B1BA", "#0d8e96"],
    cta: "Shop now",
  },
  {
    id: "p2",
    type: "boosted",
    title: "Boosted Items",
    subtitle: "Top picks from sellers near you",
    badge: "⚡ FEATURED",
    badgeColor: "#6c5ce7",
    image: require("../assets/images/promo2.png"),
    gradient: ["#1a1a2e", "#16213e"],
    cta: "Discover",
  },
  {
    id: "p3",
    type: "brand",
    title: "Vintage Finds",
    subtitle: "Curated second-hand luxury pieces",
    badge: "✨ CURATED",
    badgeColor: "#fdcb6e",
    image: require("../assets/images/promo3.png"),
    gradient: ["#fd79a8", "#e84393"],
    cta: "Browse",
  },
  {
    id: "p4",
    type: "new",
    title: "New Arrivals",
    subtitle: "Fresh listings added in the last 24h",
    badge: "🆕 NEW",
    badgeColor: "#00b894",
    image: null,
    gradient: ["#00cec9", "#09B1BA"],
    cta: "See all",
  },
];

export function PromoCarousel() {
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAuto = () => {
    autoRef.current = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % PROMO_SLIDES.length;
        scrollRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: true });
        return next;
      });
    }, 3500);
  };

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, []);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActive(idx);
  };

  const handleScrollBegin = () => {
    if (autoRef.current) clearInterval(autoRef.current);
  };

  const handleScrollEnd = () => {
    startAuto();
  };

  const styles = StyleSheet.create({
    container: { marginTop: 14, marginBottom: 4 },
    label: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginLeft: 16,
      marginBottom: 10,
    },
    scroll: { paddingHorizontal: 16 },
    slide: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: 16,
      overflow: "hidden",
      marginRight: 12,
      position: "relative",
    },
    image: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },
    overlay: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    overlayInner: {
      flex: 1,
      padding: 18,
      justifyContent: "space-between",
    },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 10,
      fontFamily: "Inter_700Bold",
      color: "#fff",
      letterSpacing: 0.5,
    },
    textBlock: { gap: 4 },
    slideTitle: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    slideSubtitle: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.85)",
    },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.35)",
    },
    ctaText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 10,
      gap: 5,
    },
    dot: {
      height: 4,
      borderRadius: 2,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Promotions & Featured</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
      >
        {PROMO_SLIDES.map((slide, i) => (
          <TouchableOpacity
            key={slide.id}
            style={[
              styles.slide,
              { backgroundColor: slide.gradient[0] },
              i === PROMO_SLIDES.length - 1 && { marginRight: 0 },
            ]}
            activeOpacity={0.9}
          >
            {slide.image && (
              <Image
                source={slide.image}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            <View
              style={[
                styles.overlay,
                {
                  backgroundColor: slide.image
                    ? "rgba(0,0,0,0.38)"
                    : "transparent",
                },
              ]}
            >
              <View style={styles.overlayInner}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  {slide.badge && (
                    <View style={[styles.badge, { backgroundColor: slide.badgeColor }]}>
                      <Text style={styles.badgeText}>{slide.badge}</Text>
                    </View>
                  )}
                  <View style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.25)",
                  }}>
                    <Text style={{ fontSize: 10, color: "#fff", fontFamily: "Inter_500Medium" }}>
                      {i + 1}/{PROMO_SLIDES.length}
                    </Text>
                  </View>
                </View>
                <View style={{ gap: 8 }}>
                  <View style={styles.textBlock}>
                    <Text style={styles.slideTitle}>{slide.title}</Text>
                    <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                  </View>
                  <TouchableOpacity style={styles.ctaBtn}>
                    <Text style={styles.ctaText}>{slide.cta}</Text>
                    <Feather name="arrow-right" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {PROMO_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: active === i ? 20 : 6,
                backgroundColor: active === i ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}
