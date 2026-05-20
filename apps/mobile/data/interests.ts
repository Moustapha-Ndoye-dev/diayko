export interface Interest {
  id: string;
  label: string;
  category: string;
  image: string;
}

// Visual interest categories shown in onboarding.
// `category` maps to the existing CATEGORIES so the home feed can be filtered.
// Images are themed around the African / Senegalese market.
export const INTERESTS: Interest[] = [
  {
    id: "women",
    label: "Femmes",
    category: "women",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=70",
  },
  {
    id: "men",
    label: "Hommes",
    category: "men",
    image:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=70",
  },
  {
    id: "kids",
    label: "Enfants",
    category: "kids",
    image:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&q=70",
  },
  {
    id: "shoes",
    label: "Chaussures",
    category: "shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=70",
  },
  {
    id: "bags",
    label: "Sacs",
    category: "bags",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=70",
  },
  {
    id: "accessories",
    label: "Accessoires",
    category: "accessories",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=70",
  },
  {
    id: "sport",
    label: "Sport",
    category: "sport",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70",
  },
  {
    id: "wax",
    label: "Wax & traditionnel",
    category: "women",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=70",
  },
  {
    id: "streetwear",
    label: "Streetwear",
    category: "men",
    image:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=70",
  },
];
