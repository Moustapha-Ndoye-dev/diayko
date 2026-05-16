import React from "react";
import Svg, { Path, Circle, G } from "react-native-svg";

interface IconProps {
  color?: string;
  size?: number;
  filled?: boolean;
}

const STROKE = 1.75;
const CAP = "round" as const;
const JOIN = "round" as const;

export function ShopIcon({ color = "#000", size = 24, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 9.5h15l-1.8 10.2a1.5 1.5 0 0 1-1.48 1.3H7.78a1.5 1.5 0 0 1-1.48-1.3L4.5 9.5Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
        strokeLinejoin={JOIN}
        fill={filled ? color : "none"}
        fillOpacity={filled ? 0.15 : 0}
      />
      <Path
        d="M9 9.5C9 7 10.5 4.5 12 4.5S15 7 15 9.5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
        strokeLinejoin={JOIN}
        fill="none"
      />
      <Path
        d="M9.5 14h5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
        fill="none"
      />
    </Svg>
  );
}

export function SearchIcon({ color = "#000", size = 24, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="10.5"
        cy="10.5"
        r="6.5"
        stroke={color}
        strokeWidth={STROKE}
        fill={filled ? color : "none"}
        fillOpacity={filled ? 0.15 : 0}
      />
      <Path
        d="M15.5 15.8L20.5 21"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
        strokeLinejoin={JOIN}
      />
    </Svg>
  );
}

export function SellIcon({ color = "#000", size = 24, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7Z"
        stroke={color}
        strokeWidth={STROKE}
        fill={filled ? color : "none"}
        fillOpacity={filled ? 0.15 : 0}
      />
      <Path
        d="M12 8v8M8 12h8"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
        strokeLinejoin={JOIN}
      />
    </Svg>
  );
}

export function InboxIcon({ color = "#000", size = 24, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
        strokeLinejoin={JOIN}
        fill={filled ? color : "none"}
        fillOpacity={filled ? 0.15 : 0}
      />
      <Path
        d="M8 10h8M8 13h5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
      />
    </Svg>
  );
}

export function ProfileIcon({ color = "#000", size = 24, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="8"
        r="4"
        stroke={color}
        strokeWidth={STROKE}
        fill={filled ? color : "none"}
        fillOpacity={filled ? 0.2 : 0}
      />
      <Path
        d="M4.5 20.5C4.5 17 7.9 14 12 14s7.5 3 7.5 6.5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
        strokeLinejoin={JOIN}
        fill="none"
      />
    </Svg>
  );
}

export function HeartIcon({ color = "#000", size = 24, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
        strokeLinejoin={JOIN}
        fill={filled ? color : "none"}
        fillOpacity={filled ? 0.9 : 0}
      />
    </Svg>
  );
}

export function BellIcon({ color = "#000", size = 24, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
        strokeLinejoin={JOIN}
        fill={filled ? color : "none"}
        fillOpacity={filled ? 0.15 : 0}
      />
      <Path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap={CAP}
        strokeLinejoin={JOIN}
      />
    </Svg>
  );
}
