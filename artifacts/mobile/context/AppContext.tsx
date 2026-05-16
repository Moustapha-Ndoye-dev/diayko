import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api, ApiItem, ApiConversation, ApiUser } from "@/lib/api";
import { MOCK_USERS } from "@/data/mockData";

// Adapts an API item to the local Item shape the UI expects
export function toItem(a: ApiItem) {
  return {
    id: a.id,
    title: a.title,
    brand: a.brand,
    price: Number(a.price),
    originalPrice: a.originalPrice != null ? Number(a.originalPrice) : undefined,
    size: a.size,
    condition: a.condition as any,
    category: a.category,
    images: a.images.length > 0 ? a.images : [require("../assets/images/item1.png")],
    description: a.description,
    seller: a.seller
      ? toUser(a.seller)
      : MOCK_USERS[0],
    likes: a.likesCount,
    views: a.viewsCount,
    postedAt: a.createdAt.slice(0, 10),
    color: a.color ?? undefined,
  };
}

export function toUser(u: ApiUser) {
  return {
    id: u.id,
    name: u.name,
    bio: u.bio ?? undefined,
    rating: Number(u.rating),
    reviewCount: u.reviewCount,
    itemCount: u.itemCount,
    followersCount: u.followersCount,
    followingCount: u.followingCount,
    joinedAt: u.createdAt.slice(0, 10),
    verified: u.verified,
  };
}

export type AppItem = ReturnType<typeof toItem>;
export type AppUser = ReturnType<typeof toUser>;

interface AppContextValue {
  items: AppItem[];
  favorites: string[];
  conversations: ApiConversation[];
  myListings: AppItem[];
  loading: boolean;
  toggleFavorite: (itemId: string) => void;
  addListing: (item: AppItem) => void;
  isFavorite: (itemId: string) => boolean;
  currentUser: AppUser;
  refreshItems: (params?: { category?: string; q?: string; size?: string; condition?: string }) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// Fallback current user (local); in a real app this would come from auth
const FALLBACK_USER = {
  id: "local-user",
  name: "Sophie Martin",
  bio: "Fashion lover, sustainable shopper.",
  rating: 4.9,
  reviewCount: 128,
  itemCount: 45,
  followersCount: 320,
  followingCount: 89,
  joinedAt: "2022-03-01",
  verified: true,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [myListings, setMyListings] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState<AppUser>(FALLBACK_USER);

  const refreshItems = useCallback(
    async (params?: { category?: string; q?: string; size?: string; condition?: string }) => {
      try {
        const res = await api.items.list({ ...params, limit: 50 });
        setItems(res.items.map(toItem));
      } catch (err) {
        console.warn("Failed to fetch items from API, keeping current state", err);
      }
    },
    []
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshItems();
      setLoading(false);
    };
    init();
  }, [refreshItems]);

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              likes: favorites.includes(itemId)
                ? item.likes - 1
                : item.likes + 1,
            }
          : item
      )
    );
    // Fire-and-forget like to API
    api.items.like(itemId, currentUser.id).catch(() => {});
  };

  const addListing = (item: AppItem) => {
    setItems((prev) => [item, ...prev]);
    setMyListings((prev) => [item, ...prev]);
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

  return (
    <AppContext.Provider
      value={{
        items,
        favorites,
        conversations,
        myListings,
        loading,
        toggleFavorite,
        addListing,
        isFavorite,
        currentUser,
        refreshItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
