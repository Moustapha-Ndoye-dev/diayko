import React from "react";
import Svg, { Path, Circle, Rect, Ellipse, G } from "react-native-svg";

interface CatIconProps {
  color: string;
  size?: number;
}

/** Femmes — silhouette robe */
export function WomanIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Tête */}
      <Circle cx="32" cy="10" r="8" fill={color} />
      {/* Robe haut */}
      <Path
        d="M20 24 C20 20 24 18 32 18 C40 18 44 20 44 24 L40 38 L24 38 Z"
        fill={color}
      />
      {/* Robe bas évasée */}
      <Path
        d="M24 38 L16 58 L48 58 L40 38 Z"
        fill={color}
        fillOpacity={0.8}
      />
      {/* Décolleté V */}
      <Path
        d="M28 18 L32 26 L36 18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity={0.5}
      />
      {/* Taille */}
      <Path
        d="M24 38 Q32 35 40 38"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeOpacity={0.35}
      />
    </Svg>
  );
}

/** Hommes — silhouette costume / chemise */
export function ManIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Tête */}
      <Circle cx="32" cy="10" r="8" fill={color} />
      {/* Corps */}
      <Path
        d="M22 22 L22 56 L42 56 L42 22 Q37 20 32 19 Q27 20 22 22 Z"
        fill={color}
      />
      {/* Manche gauche */}
      <Path
        d="M22 24 L10 34 L13 40 L22 30 Z"
        fill={color}
        fillOpacity={0.75}
      />
      {/* Manche droite */}
      <Path
        d="M42 24 L54 34 L51 40 L42 30 Z"
        fill={color}
        fillOpacity={0.75}
      />
      {/* Col gauche */}
      <Path
        d="M28 20 Q27 24 32 28"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity={0.3}
        fill="none"
      />
      {/* Col droit */}
      <Path
        d="M36 20 Q37 24 32 28"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity={0.3}
        fill="none"
      />
      {/* Boutons */}
      <Circle cx="32" cy="34" r="1.5" fill="white" fillOpacity={0.4} />
      <Circle cx="32" cy="41" r="1.5" fill="white" fillOpacity={0.4} />
      <Circle cx="32" cy="48" r="1.5" fill="white" fillOpacity={0.4} />
    </Svg>
  );
}

/** Enfants — body / grenouillère */
export function KidsIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Tête */}
      <Circle cx="32" cy="11" r="9" fill={color} />
      {/* Yeux */}
      <Circle cx="28.5" cy="9.5" r="1.8" fill="white" fillOpacity={0.85} />
      <Circle cx="35.5" cy="9.5" r="1.8" fill="white" fillOpacity={0.85} />
      <Circle cx="29" cy="9.8" r="0.9" fill={color} />
      <Circle cx="36" cy="9.8" r="0.9" fill={color} />
      {/* Sourire */}
      <Path
        d="M28 14 Q32 17 36 14"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeOpacity={0.7}
      />
      {/* Body */}
      <Path
        d="M20 24 L20 50 Q20 54 24 54 L40 54 Q44 54 44 50 L44 24 Q38 21 32 21 Q26 21 20 24 Z"
        fill={color}
        fillOpacity={0.9}
      />
      {/* Petites manches */}
      <Path d="M20 25 L12 30 L14 35 L20 30 Z" fill={color} fillOpacity={0.65} />
      <Path d="M44 25 L52 30 L50 35 L44 30 Z" fill={color} fillOpacity={0.65} />
      {/* Bouton pression bas */}
      <Circle cx="29" cy="53" r="1.5" fill="white" fillOpacity={0.45} />
      <Circle cx="35" cy="53" r="1.5" fill="white" fillOpacity={0.45} />
    </Svg>
  );
}

/** Chaussures — sneaker vue de côté */
export function ShoesIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Semelle */}
      <Path
        d="M4 50 Q4 58 12 58 L56 58 Q62 58 62 52 L62 48 L4 48 Z"
        fill={color}
        fillOpacity={0.6}
      />
      {/* Tige principale */}
      <Path
        d="M8 48 L8 36 Q8 22 18 19 Q28 16 38 20 Q50 24 54 36 L54 48 Z"
        fill={color}
      />
      {/* Languette */}
      <Path
        d="M18 20 L18 35 Q24 33 30 35 L30 20"
        fill="white"
        fillOpacity={0.18}
      />
      {/* Lacets */}
      <Path d="M19 24 L29 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity={0.55} />
      <Path d="M19 28 L30 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity={0.55} />
      <Path d="M19 32 L30 32" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity={0.55} />
      {/* Bande décorative */}
      <Path
        d="M26 44 Q38 38 52 42"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity={0.35}
      />
    </Svg>
  );
}

/** Sacs — sac à main avec anse */
export function BagIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Anse */}
      <Path
        d="M22 28 Q22 14 32 14 Q42 14 42 28"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Corps */}
      <Rect x="10" y="28" width="44" height="30" rx="6" fill={color} fillOpacity={0.92} />
      {/* Ligne rabat */}
      <Path
        d="M10 40 L54 40"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity={0.25}
      />
      {/* Fermoir */}
      <Rect x="27" y="25" width="10" height="8" rx="4" fill={color} />
      <Circle cx="32" cy="29" r="2.5" fill="white" fillOpacity={0.55} />
      {/* Reflet */}
      <Path
        d="M14 30 L14 39"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity={0.2}
      />
    </Svg>
  );
}

/** Accessoires — montre connectée / bijou */
export function WatchIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Bracelet haut */}
      <Path
        d="M24 6 Q24 4 26 4 L38 4 Q40 4 40 6 L40 18 L24 18 Z"
        fill={color}
        fillOpacity={0.6}
      />
      {/* Bracelet bas */}
      <Path
        d="M24 46 L40 46 L40 58 Q40 60 38 60 L26 60 Q24 60 24 58 Z"
        fill={color}
        fillOpacity={0.6}
      />
      {/* Boîtier */}
      <Rect x="14" y="16" width="36" height="32" rx="12" fill={color} />
      {/* Cadran */}
      <Rect x="18" y="20" width="28" height="24" rx="9" fill="white" fillOpacity={0.92} />
      {/* Couronne */}
      <Rect x="50" y="27" width="6" height="10" rx="3" fill={color} />
      {/* Aiguilles */}
      <Path d="M32 32 L32 24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M32 32 L38 32" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="32" cy="32" r="2" fill={color} />
    </Svg>
  );
}

/** Sport — maillot de sport */
export function SportIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Corps */}
      <Path
        d="M20 22 L20 58 L44 58 L44 22 Q38 20 32 19 Q26 20 20 22 Z"
        fill={color}
      />
      {/* Manche gauche */}
      <Path
        d="M20 23 L6 14 L10 8 L23 19 Z"
        fill={color}
        fillOpacity={0.78}
      />
      {/* Manche droite */}
      <Path
        d="M44 23 L58 14 L54 8 L41 19 Z"
        fill={color}
        fillOpacity={0.78}
      />
      {/* Col V */}
      <Path
        d="M27 20 L32 28 L37 20"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity={0.3}
      />
      {/* Bande horizontale */}
      <Rect x="20" y="36" width="24" height="6" fill="white" fillOpacity={0.15} />
      {/* Numéro */}
      <Path
        d="M28 40 L36 40 L31 56"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity={0.5}
      />
    </Svg>
  );
}

/** Maison — canapé / décoration intérieure */
export function HomeIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Dossier canapé */}
      <Rect x="6" y="20" width="52" height="22" rx="8" fill={color} />
      {/* Assise */}
      <Rect x="10" y="36" width="44" height="14" rx="5" fill={color} fillOpacity={0.75} />
      {/* Accoudoir gauche */}
      <Rect x="6" y="30" width="10" height="20" rx="5" fill={color} fillOpacity={0.9} />
      {/* Accoudoir droit */}
      <Rect x="48" y="30" width="10" height="20" rx="5" fill={color} fillOpacity={0.9} />
      {/* Pieds */}
      <Rect x="14" y="50" width="5" height="8" rx="2" fill={color} fillOpacity={0.6} />
      <Rect x="45" y="50" width="5" height="8" rx="2" fill={color} fillOpacity={0.6} />
      {/* Coussin */}
      <Rect x="16" y="37" width="14" height="10" rx="4" fill="white" fillOpacity={0.18} />
      <Rect x="34" y="37" width="14" height="10" rx="4" fill="white" fillOpacity={0.18} />
    </Svg>
  );
}

/** Beauté — flacon de parfum */
export function BeautyIcon({ color, size = 28 }: CatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Bouchon */}
      <Rect x="22" y="6" width="20" height="10" rx="4" fill={color} fillOpacity={0.7} />
      {/* Col flacon */}
      <Rect x="27" y="16" width="10" height="6" rx="2" fill={color} fillOpacity={0.85} />
      {/* Vaporisateur */}
      <Rect x="36" y="10" width="12" height="4" rx="2" fill={color} fillOpacity={0.55} />
      <Rect x="46" y="8" width="4" height="8" rx="2" fill={color} fillOpacity={0.45} />
      {/* Corps flacon */}
      <Rect x="14" y="22" width="36" height="36" rx="10" fill={color} fillOpacity={0.9} />
      {/* Reflet */}
      <Rect x="20" y="26" width="10" height="24" rx="5" fill="white" fillOpacity={0.18} />
      {/* Décor floral */}
      <Circle cx="38" cy="40" r="6" fill="white" fillOpacity={0.12} />
      <Circle cx="38" cy="40" r="3" fill="white" fillOpacity={0.15} />
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
  home: HomeIcon,
  beauty: BeautyIcon,
};
