import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api, ApiItem, ApiUser } from "@/lib/api";
import { Item, Seller, Condition, Conversation, ConversationItem } from "@/types";
import { ApiConversation } from "@/lib/api";
import { storage, SellerStatus } from "@/lib/storage";

// ─── Adapters ─────────────────────────────────────────────────────────────────

export function toSeller(u: ApiUser): Seller {
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

const PLACEHOLDER_SELLER: Seller = {
  id: "unknown",
  name: "Unknown seller",
  rating: 0,
  reviewCount: 0,
  itemCount: 0,
  followersCount: 0,
  followingCount: 0,
  joinedAt: "2024-01-01",
  verified: false,
};

export function toItem(a: ApiItem): Item {
  return {
    id: a.id,
    title: a.title,
    brand: a.brand,
    price: Number(a.price),
    originalPrice:
      a.originalPrice != null ? Number(a.originalPrice) : undefined,
    size: a.size,
    condition: a.condition as Condition,
    category: a.category,
    images: a.images,
    description: a.description,
    seller: a.seller ? toSeller(a.seller) : PLACEHOLDER_SELLER,
    likesCount: a.likesCount,
    viewsCount: a.viewsCount,
    postedAt: a.createdAt.slice(0, 10),
    color: a.color ?? undefined,
  };
}

function toConversationItem(item: NonNullable<ApiConversation["item"]>): ConversationItem {
  return {
    id: item.id,
    title: item.title,
    price: Number(item.price),
    images: item.images,
  };
}

function toConversation(c: ApiConversation): Conversation | null {
  if (!c.otherUser) return null;
  return {
    id: c.id,
    buyerId: c.buyerId,
    sellerId: c.sellerId,
    otherUser: toSeller(c.otherUser),
    lastMessage: c.lastMessage ?? undefined,
    lastMessageAt: c.lastMessageAt ?? undefined,
    unreadCount: c.unreadCount,
    item: c.item ? toConversationItem(c.item) : undefined,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ListFilters {
  category?: string;
  q?: string;
  size?: string;
  condition?: string;
}

interface AppContextValue {
  items: Item[];
  favorites: Set<string>;
  conversations: Conversation[];
  myListings: Item[];
  isLoading: boolean;
  toggleFavorite: (itemId: string) => void;
  addListing: (item: Item) => void;
  isFavorite: (itemId: string) => boolean;
  currentUser: Seller;
  refreshItems: (filters?: ListFilters) => Promise<void>;
  sellerStatus: SellerStatus;
  requestSellerAccess: () => Promise<void>;
  resetSellerStatus: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const CURRENT_USER: Seller = {
  id: "00000000-0000-0000-0000-000000000001",
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
  const [items, setItems] = useState<Item[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [myListings, setMyListings] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sellerStatus, setSellerStatus] = useState<SellerStatus>("none");

  useEffect(() => {
    storage.sellerStatus.get().then(setSellerStatus);
  }, []);

  // Simulated reviewer: when a request is submitted, auto-approve after ~6s.
  // Replace with a real backend approval flow when the moderation pipeline ships.
  useEffect(() => {
    if (sellerStatus !== "pending") return;
    const t = setTimeout(async () => {
      await storage.sellerStatus.set("approved");
      setSellerStatus("approved");
    }, 6000);
    return () => clearTimeout(t);
  }, [sellerStatus]);

  const requestSellerAccess = useCallback(async () => {
    await storage.sellerStatus.set("pending");
    setSellerStatus("pending");
  }, []);

  const resetSellerStatus = useCallback(async () => {
    await storage.sellerStatus.set("none");
    setSellerStatus("none");
  }, []);

  const refreshItems = useCallback(async (filters?: ListFilters) => {
    try {
      const res = await api.items.list({ ...filters, limit: 50 });
      setItems(res.items.map(toItem));
    } catch {
      // Silently keep the existing state; screens handle their own error display
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refreshItems().finally(() => setIsLoading(false));
  }, [refreshItems]);

  const toggleFavorite = useCallback(
    (itemId: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        return next;
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                likesCount: favorites.has(itemId)
                  ? item.likesCount - 1
                  : item.likesCount + 1,
              }
            : item
        )
      );
      api.items.like(itemId, CURRENT_USER.id).catch(() => {});
    },
    [favorites]
  );

  const addListing = useCallback((item: Item) => {
    setItems((prev) => [item, ...prev]);
    setMyListings((prev) => [item, ...prev]);
  }, []);

  const isFavorite = useCallback(
    (itemId: string) => favorites.has(itemId),
    [favorites]
  );

  return (
    <AppContext.Provider
      value={{
        items,
        favorites,
        conversations,
        myListings,
        isLoading,
        toggleFavorite,
        addListing,
        isFavorite,
        currentUser: CURRENT_USER,
        refreshItems,
        sellerStatus,
        requestSellerAccess,
        resetSellerStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
