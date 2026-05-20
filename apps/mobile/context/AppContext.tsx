import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { api, ApiItem, ApiUser, ApiConversation } from "@/lib/api";
import { useAuth, type AuthUser } from "@/lib/auth";
import type { Condition, Conversation, ConversationItem, Item, Seller } from "@/types";

// ─── Adapters ─────────────────────────────────────────────────────────────────

export function toSeller(u: ApiUser): Seller {
  return {
    id: u.id,
    name: u.name ?? "Vendeur",
    bio: u.bio ?? undefined,
    profileImageUrl: u.profileImageUrl ?? undefined,
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
      a.originalPrice == null ? undefined : Number(a.originalPrice),
    size: a.size,
    condition: a.condition as Condition,
    category: a.category,
    images: a.images,
    description: a.description,
    seller: a.seller ? toSeller(a.seller) : PLACEHOLDER_SELLER,
    likesCount: a.likesCount,
    viewsCount: a.viewsCount,
    status: a.status ?? "available",
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

function authUserToSeller(user: AuthUser): Seller {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Mon compte";
  return {
    id: user.id,
    name,
    bio: undefined,
    profileImageUrl: user.profileImageUrl ?? undefined,
    rating: 0,
    reviewCount: 0,
    itemCount: 0,
    followersCount: 0,
    followingCount: 0,
    joinedAt: new Date().toISOString().slice(0, 10),
    verified: false,
  };
}

function resolveCurrentUser(
  fullProfile: ApiUser | null,
  user: AuthUser | null | undefined,
): Seller {
  if (fullProfile) return toSeller(fullProfile);
  if (user) return authUserToSeller(user);
  return PLACEHOLDER_SELLER;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export type SellerStatus = "none" | "pending" | "approved";

interface ListFilters {
  category?: string;
  q?: string;
  size?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "newest";
  page?: number;
  limit?: number;
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
  refreshProfile: () => Promise<void>;
  updateProfile: (fields: { name?: string; bio?: string | null }) => Promise<void>;
  sellerStatus: SellerStatus;
  requestSellerAccess: () => Promise<void>;
  resetSellerStatus: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  readonly children: ReactNode;
}

export function AppProvider(props: Readonly<AppProviderProps>) {
  const { children } = props;
  const { user, refreshUser } = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [myListings, setMyListings] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fullProfile, setFullProfile] = useState<ApiUser | null>(null);

  const sellerStatus: SellerStatus = (user?.sellerStatus as SellerStatus) ?? "none";

  const refreshConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }
    try {
      const rows = await api.conversations.list();
      setConversations(
        rows.map(toConversation).filter((c): c is Conversation => c !== null),
      );
    } catch {
      //
    }
  }, [user]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const currentUser = useMemo(
    () => resolveCurrentUser(fullProfile, user),
    [fullProfile, user],
  );

  const requestSellerAccess = useCallback(async () => {
    await api.sellerAccess.request();
    await refreshUser();
  }, [refreshUser]);

  const resetSellerStatus = useCallback(async () => {
    await api.sellerAccess.reset();
    await refreshUser();
  }, [refreshUser]);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setFullProfile(null);
      return;
    }
    try {
      const profile = await api.users.get(user.id);
      setFullProfile(profile);
    } catch {
      // Keep fallback auth data on error
    }
  }, [user]);

  const updateProfile = useCallback(
    async (fields: { name?: string; bio?: string | null }) => {
      if (!user) return;
      const updated = await api.users.update(user.id, fields);
      setFullProfile(updated);
    },
    [user],
  );

  // Load full profile whenever the authenticated user changes
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const refreshItems = useCallback(async (filters?: ListFilters) => {
    try {
      const res = await api.items.list({ ...filters, limit: 50 });
      setItems(res.items.map(toItem));
    } catch {
      // Silently keep the existing state; screens handle their own error display
    }
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.favorites.list();
      setFavorites(new Set(res.ids));
    } catch {
      // Keep current favorites set on error.
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([refreshItems(), refreshFavorites()]).finally(() => setIsLoading(false));
  }, [refreshItems, refreshFavorites]);

  const toggleFavorite = useCallback(
    (itemId: string) => {
      if (!user) return;
      const wasFavorite = favorites.has(itemId);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.delete(itemId);
        else next.add(itemId);
        return next;
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                likesCount: wasFavorite ? item.likesCount - 1 : item.likesCount + 1,
              }
            : item,
        ),
      );
      api.items.like(itemId).catch(() => {
        refreshFavorites();
      });
    },
    [favorites, refreshFavorites, user],
  );

  const addListing = useCallback((item: Item) => {
    setItems((prev) => [item, ...prev]);
    setMyListings((prev) => [item, ...prev]);
  }, []);

  const isFavorite = useCallback(
    (itemId: string) => favorites.has(itemId),
    [favorites]
  );

  const contextValue = useMemo(
    () => ({
      items,
      favorites,
      conversations,
      myListings,
      isLoading,
      toggleFavorite,
      addListing,
      isFavorite,
      currentUser,
      refreshItems,
      refreshProfile,
      updateProfile,
      sellerStatus,
      requestSellerAccess,
      resetSellerStatus,
    }),
    [
      items,
      favorites,
      conversations,
      myListings,
      isLoading,
      toggleFavorite,
      addListing,
      isFavorite,
      currentUser,
      refreshItems,
      refreshProfile,
      updateProfile,
      sellerStatus,
      requestSellerAccess,
      resetSellerStatus,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
