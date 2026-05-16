import { Item, Seller, Conversation, Category, Condition } from "@/types";

export const CATEGORIES: Category[] = [
  { id: "all", label: "Tout", icon: "grid" },
  { id: "women", label: "Femmes", icon: "woman" },
  { id: "men", label: "Hommes", icon: "man" },
  { id: "kids", label: "Enfants", icon: "happy" },
  { id: "shoes", label: "Chaussures", icon: "footsteps" },
  { id: "bags", label: "Sacs", icon: "bag-handle" },
  { id: "accessories", label: "Accessoires", icon: "watch" },
  { id: "sport", label: "Sport", icon: "basketball" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Taille unique"];

export const CONDITIONS: Condition[] = [
  "New with tags",
  "Like new",
  "Good",
  "Fair",
];

export const CONDITION_LABELS: Record<Condition, string> = {
  "New with tags": "Neuf avec étiquette",
  "Like new": "Comme neuf",
  Good: "Bon état",
  Fair: "État correct",
};

export const SIZE_LABELS: Record<string, string> = {
  "One Size": "Taille unique",
};

export function conditionLabel(c: Condition | string): string {
  return CONDITION_LABELS[c as Condition] ?? String(c);
}

export function sizeLabel(s: string): string {
  return SIZE_LABELS[s] ?? s;
}

export const MOCK_USERS: Seller[] = [
  {
    id: "u1",
    name: "Aïssatou Diop",
    rating: 4.9,
    reviewCount: 128,
    itemCount: 45,
    followersCount: 320,
    followingCount: 89,
    joinedAt: "2022-03-01",
    verified: true,
    bio: "Passionnée de mode, vendeuse responsable. Tous les articles viennent de ma propre garde-robe.",
  },
  {
    id: "u2",
    name: "Fatou Ndiaye",
    rating: 4.7,
    reviewCount: 64,
    itemCount: 23,
    followersCount: 180,
    followingCount: 45,
    joinedAt: "2023-01-15",
    verified: false,
    bio: "Dressing minimaliste, trouvailles vintage.",
  },
  {
    id: "u3",
    name: "Moussa Sarr",
    rating: 4.8,
    reviewCount: 92,
    itemCount: 31,
    followersCount: 210,
    followingCount: 120,
    joinedAt: "2022-09-10",
    verified: false,
  },
  {
    id: "u4",
    name: "Awa Faye",
    rating: 5.0,
    reviewCount: 47,
    itemCount: 18,
    followersCount: 95,
    followingCount: 37,
    joinedAt: "2023-06-20",
    verified: true,
  },
  {
    id: "u5",
    name: "Mamadou Ba",
    rating: 4.6,
    reviewCount: 33,
    itemCount: 12,
    followersCount: 58,
    followingCount: 21,
    joinedAt: "2024-01-05",
    verified: false,
  },
];

// Fallback items used when the API is unreachable.
export const MOCK_ITEMS: Item[] = [
  {
    id: "i1",
    title: "Veste en jean classique",
    brand: "Levi's",
    price: 12000,
    originalPrice: 35000,
    size: "M",
    condition: "Like new",
    category: "women",
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&q=70",
    ],
    description:
      "Veste en jean Levi's à peine portée, en parfait état. Idéale à superposer. Aucune tache ni dommage.",
    seller: MOCK_USERS[0]!,
    likesCount: 24,
    viewsCount: 158,
    postedAt: "2024-05-10",
    color: "Bleu",
  },
  {
    id: "i2",
    title: "Manteau camel élégant",
    brand: "Zara",
    price: 20000,
    originalPrice: 55000,
    size: "S",
    condition: "Good",
    category: "women",
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=70",
    ],
    description:
      "Beau manteau camel, chaud et stylé. Porté quelques fois l'hiver dernier.",
    seller: MOCK_USERS[1]!,
    likesCount: 41,
    viewsCount: 302,
    postedAt: "2024-05-12",
    color: "Camel",
  },
  {
    id: "i3",
    title: "Sac bandoulière en cuir",
    brand: "Mango",
    price: 9000,
    originalPrice: 25000,
    size: "Taille unique",
    condition: "Good",
    category: "bags",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=70",
    ],
    description:
      "Sac bandoulière en cuir noir épuré. Bandoulière réglable, plusieurs compartiments.",
    seller: MOCK_USERS[2]!,
    likesCount: 18,
    viewsCount: 94,
    postedAt: "2024-05-13",
    color: "Noir",
  },
  {
    id: "i4",
    title: "Air Force 1 blanche",
    brand: "Nike",
    price: 25000,
    originalPrice: 45000,
    size: "38",
    condition: "Like new",
    category: "shoes",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=70",
    ],
    description:
      "Nike Air Force 1 en excellent état. Portée deux fois. Boîte d'origine incluse.",
    seller: MOCK_USERS[3]!,
    likesCount: 87,
    viewsCount: 534,
    postedAt: "2024-05-14",
    color: "Blanc",
  },
  {
    id: "i5",
    title: "Robe d'été fleurie",
    brand: "H&M",
    price: 5500,
    originalPrice: 15000,
    size: "XS",
    condition: "Good",
    category: "women",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=70",
    ],
    description:
      "Robe fleurie légère et fluide, parfaite pour l'été. Lavable en machine.",
    seller: MOCK_USERS[4]!,
    likesCount: 33,
    viewsCount: 210,
    postedAt: "2024-05-15",
    color: "Multicolore",
  },
  {
    id: "i6",
    title: "Pull oversize en maille",
    brand: "COS",
    price: 15000,
    originalPrice: 38000,
    size: "L",
    condition: "Like new",
    category: "women",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=70",
    ],
    description:
      "Pull oversize crème COS, incroyablement doux et confortable. Parfait état, porté une seule fois.",
    seller: MOCK_USERS[0]!,
    likesCount: 56,
    viewsCount: 389,
    postedAt: "2024-05-09",
    color: "Crème",
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    buyerId: "u2",
    sellerId: "u1",
    otherUser: MOCK_USERS[1]!,
    lastMessage: "La veste est-elle toujours disponible ?",
    lastMessageAt: "2024-05-15T14:23:00Z",
    unreadCount: 1,
    item: {
      id: "i1",
      title: "Veste en jean classique",
      price: 12000,
      images: [MOCK_ITEMS[0]!.images[0]!],
    },
  },
  {
    id: "c2",
    buyerId: "u1",
    sellerId: "u3",
    otherUser: MOCK_USERS[2]!,
    lastMessage: "Merci ! Je l'envoie demain.",
    lastMessageAt: "2024-05-14T09:10:00Z",
    unreadCount: 0,
    item: {
      id: "i3",
      title: "Sac bandoulière en cuir",
      price: 9000,
      images: [MOCK_ITEMS[2]!.images[0]!],
    },
  },
  {
    id: "c3",
    buyerId: "u4",
    sellerId: "u1",
    otherUser: MOCK_USERS[3]!,
    lastMessage: "Vous pouvez faire 22 000 FCFA pour les baskets ?",
    lastMessageAt: "2024-05-13T18:45:00Z",
    unreadCount: 2,
    item: {
      id: "i4",
      title: "Air Force 1 blanche",
      price: 25000,
      images: [MOCK_ITEMS[3]!.images[0]!],
    },
  },
];
