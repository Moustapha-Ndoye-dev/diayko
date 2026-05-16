import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = 168;

type PromoTag = {
  label: string;
  color: string;
};

interface PromoSlide {
  id: string;
  tag: PromoTag;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  // Gradient applied as an overlay on top of the image for contrast.
  overlay: [string, string];
}

// Professional, brand-style copy. No emojis, no "🔥 HOT" — clean typographic tags.
const PROMO_SLIDES: PromoSlide[] = [
  {
    id: "p1",
    tag: { label: "SOLDES", color: "#C84B1C" },
    title: "Bonnes affaires",
    subtitle: "Jusqu'à -70% sur une sélection d'articles",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80",
    cta: "Voir les offres",
    overlay: ["rgba(0,0,0,0.05)", "rgba(0,0,0,0.55)"],
  },
  {
    id: "p2",
    tag: { label: "COUP DE CŒUR", color: "#00853F" },
    title: "Sélection du moment",
    subtitle: "Articles mis en avant par notre équipe",
    image:
      "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=900&q=80",
    cta: "Découvrir",
    overlay: ["rgba(0,0,0,0.10)", "rgba(0,0,0,0.60)"],
  },
  {
    id: "p3",
    tag: { label: "NOUVEAUTÉS", color: "#F5C518" },
    title: "Dernières arrivées",
    subtitle: "Ajoutées dans les dernières 24 heures",
    image:
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=900&q=80",
    cta: "Découvrir",
    overlay: ["rgba(0,0,0,0.05)", "rgba(0,0,0,0.55)"],
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
        scrollRef.current?.scrollTo({ x: next * (CARD_WIDTH + 12), animated: true });
        return next;
      });
    }, 4500);
  };

  useEffect(() => {
    startAuto();
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
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
      backgroundColor: "#1a1a1a",
    },
    image: { ...StyleSheet.absoluteFillObject },
    overlay: { ...StyleSheet.absoluteFillObject },
    content: {
      flex: 1,
      padding: 18,
      justifyContent: "space-between",
    },
    tag: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 3,
    },
    tagText: {
      fontSize: 10,
      fontFamily: "Inter_700Bold",
      color: "#fff",
      letterSpacing: 1.2,
    },
    title: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#fff",
      letterSpacing: -0.4,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.9)",
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginTop: 10,
    },
    cta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    ctaText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
      textDecorationLine: "underline",
      textDecorationColor: "rgba(255,255,255,0.5)",
    },
    pageIndicator: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.7)",
      letterSpacing: 0.5,
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 12,
      gap: 5,
    },
    dot: {
      height: 4,
      borderRadius: 2,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sélection</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
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
            style={styles.slide}
            activeOpacity={0.92}
            accessibilityRole="button"
            accessibilityLabel={`${slide.title}, ${slide.subtitle}`}
          >
            <Image
              source={{ uri: slide.image }}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={slide.overlay}
              style={styles.overlay}
            />
            <View style={styles.content}>
              <View style={[styles.tag, { backgroundColor: slide.tag.color }]}>
                <Text style={styles.tagText}>{slide.tag.label}</Text>
              </View>
              <View>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
                <View style={styles.bottomRow}>
                  <View style={styles.cta}>
                    <Text style={styles.ctaText}>{slide.cta}</Text>
                    <Feather name="arrow-right" size={14} color="#fff" />
                  </View>
                  <Text style={styles.pageIndicator}>
                    {String(i + 1).padStart(2, "0")} / {String(PROMO_SLIDES.length).padStart(2, "0")}
                  </Text>
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
