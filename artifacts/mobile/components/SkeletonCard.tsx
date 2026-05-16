import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

function SkeletonPulse({ style }: { style: object }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[style, { opacity }]} />;
}

export function SkeletonCard() {
  const colors = useColors();

  const styles = StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      aspectRatio: 3 / 4,
      backgroundColor: colors.muted,
    },
    info: {
      padding: 8,
      gap: 6,
    },
    line: {
      borderRadius: 4,
      backgroundColor: colors.muted,
    },
  });

  return (
    <View style={styles.card}>
      <SkeletonPulse style={styles.image} />
      <View style={styles.info}>
        <SkeletonPulse style={[styles.line, { height: 10, width: "60%" }]} />
        <SkeletonPulse style={[styles.line, { height: 12, width: "80%" }]} />
        <SkeletonPulse style={[styles.line, { height: 14, width: "40%" }]} />
      </View>
    </View>
  );
}

export function SkeletonGrid() {
  return (
    <View
      style={{
        padding: 12,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
