export interface Interest {
  id: string;
  label: string;
  category: string;
  image: string;
}

// Visual interest categories shown in onboarding.
// `category` maps to the existing CATEGORIES so the home feed can be filtered.
export const INTERESTS: Interest[] = [
  {
    id: "women",
    label: "Women",
    category: "women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=70",
  },
  {
    id: "men",
    label: "Men",
    category: "men",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&q=70",
  },
  {
    id: "kids",
    label: "Kids",
    category: "kids",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&q=70",
  },
  {
    id: "shoes",
    label: "Shoes",
    category: "shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=70",
  },
  {
    id: "bags",
    label: "Bags",
    category: "bags",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=70",
  },
  {
    id: "accessories",
    label: "Accessories",
    category: "accessories",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=70",
  },
  {
    id: "sport",
    label: "Sport",
    category: "sport",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70",
  },
  {
    id: "vintage",
    label: "Vintage",
    category: "women",
    image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=400&q=70",
  },
  {
    id: "streetwear",
    label: "Streetwear",
    category: "men",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=70",
  },
];
