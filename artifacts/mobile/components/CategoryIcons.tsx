import React from "react";
import Svg, { Path, Circle, Rect, Ellipse, Line } from "react-native-svg";

interface CatIconProps {
  color: string;
  size?: number;
}

/** Femmes — robe A-line avec ceinture et décolleté V */
export function WomanIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Tête */}
      <Circle cx="16" cy="4.5" r="3.2" fill={color} />
      {/* Cou */}
      <Rect x="14.7" y="7.4" width="2.6" height="2.2" rx="1.1" fill={color} />
      {/* Manches courtes */}
      <Ellipse cx="9.8" cy="13" rx="3.2" ry="1.8" fill={color} fillOpacity={0.62} />
      <Ellipse cx="22.2" cy="13" rx="3.2" ry="1.8" fill={color} fillOpacity={0.62} />
      {/* Corsage ajusté */}
      <Path
        d="M11.5 10.5 Q11 9.4 16 9.4 Q21 9.4 20.5 10.5 L19.8 17.5 Q16 16.4 12.2 17.5 Z"
        fill={color}
      />
      {/* Jupe évasée */}
      <Path
        d="M12.2 17.5 Q16 16.4 19.8 17.5 L25 30.5 Q16 28.2 7 30.5 Z"
        fill={color}
        fillOpacity={0.78}
      />
      {/* Décolleté V */}
      <Path
        d="M14 10.2 L16 13 L18 10.2"
        stroke="white"
        strokeWidth={1.35}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity={0.65}
      />
      {/* Ceinture */}
      <Path
        d="M12.2 17.5 Q16 16.4 19.8 17.5"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
        strokeOpacity={0.42}
      />
    </Svg>
  );
}

/** Hommes — polo avec col et manches */
export function ManIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Tête */}
      <Circle cx="16" cy="4.5" r="3.2" fill={color} />
      {/* Corps */}
      <Path
        d="M11 11 L11 30.5 L21 30.5 L21 11 Q18.5 10.4 16 9.8 Q13.5 10.4 11 11 Z"
        fill={color}
      />
      {/* Manche gauche */}
      <Path
        d="M11 12.5 L4.5 16.5 L6 19.5 L11 16 Z"
        fill={color}
        fillOpacity={0.72}
      />
      {/* Manche droite */}
      <Path
        d="M21 12.5 L27.5 16.5 L26 19.5 L21 16 Z"
        fill={color}
        fillOpacity={0.72}
      />
      {/* Col gauche */}
      <Path
        d="M13.8 10 Q13.2 11.5 16 14"
        stroke="white"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeOpacity={0.28}
        fill="none"
      />
      {/* Col droit */}
      <Path
        d="M18.2 10 Q18.8 11.5 16 14"
        stroke="white"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeOpacity={0.28}
        fill="none"
      />
      {/* Placket boutons */}
      <Line
        x1="16" y1="14.5" x2="16" y2="27.5"
        stroke="white"
        strokeWidth={1.25}
        strokeDasharray="1.8 2.6"
        strokeLinecap="round"
        strokeOpacity={0.48}
      />
    </Svg>
  );
}

/** Enfants — ours en peluche avec expression douce */
export function KidsIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Oreilles */}
      <Circle cx="8.5" cy="8" r="5" fill={color} />
      <Circle cx="23.5" cy="8" r="5" fill={color} />
      {/* Intérieur oreilles */}
      <Circle cx="8.5" cy="8" r="2.8" fill="white" fillOpacity={0.3} />
      <Circle cx="23.5" cy="8" r="2.8" fill="white" fillOpacity={0.3} />
      {/* Tête */}
      <Circle cx="16" cy="18" r="12.5" fill={color} />
      {/* Yeux blancs */}
      <Circle cx="12" cy="15.5" r="2.2" fill="white" />
      <Circle cx="20" cy="15.5" r="2.2" fill="white" />
      {/* Pupilles */}
      <Circle cx="12.6" cy="15.8" r="1.1" fill={color} />
      <Circle cx="20.6" cy="15.8" r="1.1" fill={color} />
      {/* Reflets yeux */}
      <Circle cx="13.1" cy="15.2" r="0.45" fill="white" />
      <Circle cx="21.1" cy="15.2" r="0.45" fill="white" />
      {/* Museau */}
      <Ellipse cx="16" cy="21.5" rx="5.5" ry="4" fill="white" fillOpacity={0.28} />
      {/* Nez */}
      <Ellipse cx="16" cy="20" rx="2" ry="1.4" fill="white" fillOpacity={0.9} />
      {/* Sourire */}
      <Path
        d="M12.8 23 Q16 25.8 19.2 23"
        stroke="white"
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
        strokeOpacity={0.75}
      />
    </Svg>
  );
}

/** Chaussures — basket profil vue latérale */
export function ShoesIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Semelle épaisse */}
      <Path
        d="M2.5 27 Q2.5 29.5 5.5 29.5 L27.5 29.5 Q30.5 29.5 30.5 27 L30.5 25.5 L2.5 25.5 Z"
        fill={color}
        fillOpacity={0.62}
      />
      {/* Tige upper */}
      <Path
        d="M4.5 25.5 L4.5 19.5 Q4.5 13.5 9 11.5 Q14 9.5 19.5 11 Q25 12.5 27 17.5 L27 25.5 Z"
        fill={color}
      />
      {/* Languette */}
      <Path
        d="M9.5 11.8 L9.5 18 Q12.5 17.2 15.5 18 L15.5 11.5"
        fill="white"
        fillOpacity={0.22}
      />
      {/* Lacets */}
      <Line x1="10" y1="13.5" x2="15" y2="13.5" stroke="white" strokeWidth={1.1} strokeLinecap="round" strokeOpacity={0.58} />
      <Line x1="10" y1="15.2" x2="15.5" y2="15.2" stroke="white" strokeWidth={1.1} strokeLinecap="round" strokeOpacity={0.58} />
      <Line x1="10" y1="16.9" x2="15.5" y2="16.9" stroke="white" strokeWidth={1.1} strokeLinecap="round" strokeOpacity={0.58} />
      {/* Bande logo latérale */}
      <Path
        d="M13 22.5 Q19.5 19.5 25.5 21.5"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
        strokeOpacity={0.38}
      />
    </Svg>
  );
}

/** Sacs — sac à main structuré avec fermoir */
export function BagIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Anse */}
      <Path
        d="M11.5 14 Q11.5 7 16 7 Q20.5 7 20.5 14"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
      {/* Corps sac */}
      <Path
        d="M5.5 15 Q5.5 13.2 7 13.2 L25 13.2 Q26.5 13.2 26.5 15 L26.5 26.5 Q26.5 29.5 24 29.5 L8 29.5 Q5.5 29.5 5.5 26.5 Z"
        fill={color}
        fillOpacity={0.92}
      />
      {/* Séparation rabat */}
      <Path
        d="M5.5 20.5 L26.5 20.5"
        stroke="white"
        strokeWidth={1}
        strokeOpacity={0.28}
      />
      {/* Fermoir corps */}
      <Rect x="13.5" y="12" width="5" height="3.8" rx="1.8" fill={color} />
      {/* Détail fermoir */}
      <Circle cx="16" cy="13.8" r="1.3" fill="white" fillOpacity={0.58} />
      {/* Reflet sac */}
      <Path
        d="M7.5 15 L7.5 20"
        stroke="white"
        strokeWidth={1}
        strokeLinecap="round"
        strokeOpacity={0.22}
      />
    </Svg>
  );
}

/** Accessoires — montre sport rectangulaire moderne */
export function WatchIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Bracelet haut */}
      <Path
        d="M12.5 3.5 Q12.5 2.5 13.5 2.5 L18.5 2.5 Q19.5 2.5 19.5 3.5 L19.5 10 L12.5 10 Z"
        fill={color}
        fillOpacity={0.62}
      />
      {/* Bracelet bas */}
      <Path
        d="M12.5 22 L19.5 22 L19.5 28.5 Q19.5 29.5 18.5 29.5 L13.5 29.5 Q12.5 29.5 12.5 28.5 Z"
        fill={color}
        fillOpacity={0.62}
      />
      {/* Boîtier */}
      <Rect x="7" y="9" width="18" height="14" rx="5.5" fill={color} />
      {/* Cadran */}
      <Rect x="9.8" y="11.5" width="12.4" height="9" rx="3.5" fill="white" fillOpacity={0.95} />
      {/* Couronne latérale */}
      <Rect x="24.8" y="14.2" width="3" height="3.6" rx="1" fill={color} />
      {/* Aiguille minutes */}
      <Line x1="16" y1="16" x2="16" y2="12.8" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      {/* Aiguille heures */}
      <Line x1="16" y1="16" x2="19.5" y2="16" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      {/* Point central */}
      <Circle cx="16" cy="16" r="1.1" fill={color} />
    </Svg>
  );
}

/** Sport — maillot de sport avec col V et manches */
export function SportIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Corps maillot */}
      <Path
        d="M10.5 11.5 L10.5 30 L21.5 30 L21.5 11.5 Q19 11 16 10.5 Q13 11 10.5 11.5 Z"
        fill={color}
      />
      {/* Manche gauche */}
      <Path
        d="M10.5 12 L3.5 8 L5.5 4.5 L11.5 10.5 Z"
        fill={color}
        fillOpacity={0.78}
      />
      {/* Manche droite */}
      <Path
        d="M21.5 12 L28.5 8 L26.5 4.5 L20.5 10.5 Z"
        fill={color}
        fillOpacity={0.78}
      />
      {/* Col V */}
      <Path
        d="M14 10.8 L16 14.5 L18 10.8"
        stroke="white"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity={0.28}
      />
      {/* Bande horizontale décor */}
      <Rect x="10.5" y="18.5" width="11" height="3" fill="white" fillOpacity={0.18} />
      {/* Numéro "7" stylisé */}
      <Path
        d="M14 22.5 L18 22.5 L15 30"
        stroke="white"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity={0.58}
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
