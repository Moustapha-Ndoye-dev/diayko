import React from "react";
import Svg, { Path, Circle, Rect, Ellipse, G, Line } from "react-native-svg";

interface CatIconProps {
  color: string;
  size?: number;
}

/** Femmes — robe A-line élégante */
export function WomanIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* Tête */}
      <Circle cx="14" cy="5.5" r="2.8" fill={color} />
      {/* Corsage */}
      <Path
        d="M10.5 10.5 Q11.5 8.5 14 8.5 Q16.5 8.5 17.5 10.5 L16.5 15 Q14 14.2 11.5 15 Z"
        fill={color}
      />
      {/* Jupe évasée */}
      <Path
        d="M11.5 15 Q14 14.2 16.5 15 L20.5 25.5 Q14 23.8 7.5 25.5 Z"
        fill={color}
        fillOpacity={0.85}
      />
      {/* Ceinture */}
      <Path
        d="M11.5 15 Q14 14.2 16.5 15"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
      />
    </Svg>
  );
}

/** Hommes — chemise avec col */
export function ManIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* Tête */}
      <Circle cx="14" cy="5" r="2.8" fill={color} />
      {/* Corps chemise */}
      <Path
        d="M9 25 L9 14 L7 11 L10 9.5 L14 13 L18 9.5 L21 11 L19 14 L19 25 Z"
        fill={color}
        fillOpacity={0.9}
      />
      {/* Col gauche */}
      <Path d="M10 9.5 L14 13 L14 10.5 Z" fill={color} opacity={0.5} />
      {/* Col droit */}
      <Path d="M18 9.5 L14 13 L14 10.5 Z" fill={color} opacity={0.5} />
      {/* Bouton */}
      <Line x1="14" y1="14" x2="14" y2="21" stroke="white" strokeWidth={1.2} strokeDasharray="1.5 2" strokeLinecap="round" />
    </Svg>
  );
}

/** Enfants — petite étoile avec visage souriant */
export function KidsIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* Étoile 5 branches */}
      <Path
        d="M14 3 L16.2 9.6 L23.5 9.6 L17.7 13.8 L19.9 20.4 L14 16.2 L8.1 20.4 L10.3 13.8 L4.5 9.6 L11.8 9.6 Z"
        fill={color}
      />
      {/* Yeux souriants */}
      <Circle cx="11.5" cy="12" r="0.9" fill="white" />
      <Circle cx="16.5" cy="12" r="0.9" fill="white" />
      {/* Sourire */}
      <Path d="M11.5 14.5 Q14 16.5 16.5 14.5" stroke="white" strokeWidth={1.2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Chaussures — profil basket latéral */
export function ShoesIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* Semelle */}
      <Path
        d="M3 21.5 Q3 24 6 24 L24 24 Q26.5 24 26.5 21.5 Q26.5 20 24 20 L14 20 Z"
        fill={color}
        fillOpacity={0.7}
      />
      {/* Tige */}
      <Path
        d="M5 20 L5 14 Q5 11 9 10 L16 10 Q20 10 22 13 L24 20 Z"
        fill={color}
      />
      {/* Languette */}
      <Path
        d="M9 10 L9 14.5 Q12 14 15 14.5 L15 10.5"
        fill="white"
        fillOpacity={0.25}
      />
      {/* Lacets */}
      <Path d="M9.5 12 L14.5 12" stroke="white" strokeWidth={1} strokeLinecap="round" opacity={0.6} />
      <Path d="M9.5 13.5 L14.5 13.5" stroke="white" strokeWidth={1} strokeLinecap="round" opacity={0.6} />
    </Svg>
  );
}

/** Sacs — sac à main structuré */
export function BagIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* Anse */}
      <Path
        d="M10 12 Q10 6.5 14 6.5 Q18 6.5 18 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      {/* Corps */}
      <Path
        d="M5 12.5 Q5 11 6.5 11 L21.5 11 Q23 11 23 12.5 L23 23 Q23 25 21 25 L7 25 Q5 25 5 23 Z"
        fill={color}
        fillOpacity={0.9}
      />
      {/* Poche centrale */}
      <Path
        d="M11 18 Q14 20 17 18 L17 22 Q14 24 11 22 Z"
        fill="white"
        fillOpacity={0.2}
      />
      {/* Fermoir */}
      <Rect x="12" y="10.5" width="4" height="2.5" rx="1.2" fill={color} />
    </Svg>
  );
}

/** Accessoires — montre-bracelet */
export function WatchIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* Bracelet haut */}
      <Rect x="11" y="3" width="6" height="6" rx="1.5" fill={color} fillOpacity={0.6} />
      {/* Bracelet bas */}
      <Rect x="11" y="19" width="6" height="6" rx="1.5" fill={color} fillOpacity={0.6} />
      {/* Boîtier */}
      <Circle cx="14" cy="14" r="7.5" fill={color} />
      {/* Cadran */}
      <Circle cx="14" cy="14" r="5.5" fill="white" fillOpacity={0.95} />
      {/* Couronne */}
      <Rect x="21" y="12.8" width="2.5" height="2.4" rx="0.8" fill={color} />
      {/* Aiguille minutes */}
      <Line x1="14" y1="14" x2="14" y2="9.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      {/* Aiguille heures */}
      <Line x1="14" y1="14" x2="17.5" y2="14" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      {/* Centre */}
      <Circle cx="14" cy="14" r="0.8" fill={color} />
    </Svg>
  );
}

/** Sport — ballon de basket avec coutures */
export function SportIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* Ballon */}
      <Circle cx="14" cy="14" r="11" fill={color} />
      {/* Couture verticale */}
      <Path
        d="M14 3 Q18 8.5 18 14 Q18 19.5 14 25"
        stroke="white"
        strokeWidth={1.3}
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
      {/* Couture horizontale */}
      <Path
        d="M3 14 Q8.5 10 14 10 Q19.5 10 25 14"
        stroke="white"
        strokeWidth={1.3}
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
      {/* Couture diagonale gauche */}
      <Path
        d="M5 8 Q9 11 9 16 Q9 20 6 23"
        stroke="white"
        strokeWidth={1.1}
        strokeLinecap="round"
        fill="none"
        opacity={0.4}
      />
      {/* Couture diagonale droite */}
      <Path
        d="M23 8 Q19 11 19 16 Q19 20 22 23"
        stroke="white"
        strokeWidth={1.1}
        strokeLinecap="round"
        fill="none"
        opacity={0.4}
      />
    </Svg>
  );
}

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<CatIconProps>> = {
  women: WomanIcon,
  men: ManIcon,
  kids: KidsIcon,
  shoes: ShoesIcon,
  bags: BagIcon,
  accessories: WatchIcon,
  sport: SportIcon,
};
