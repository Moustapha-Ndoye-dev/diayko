import React, { createContext, useContext, useState, ReactNode } from "react";
import { Item, Conversation } from "@/types";
import { MOCK_ITEMS, MOCK_CONVERSATIONS, MOCK_USERS } from "@/data/mockData";

interface AppContextValue {
  items: Item[];
  favorites: string[];
  conversations: Conversation[];
  myListings: Item[];
  toggleFavorite: (itemId: string) => void;
  addListing: (item: Item) => void;
  isFavorite: (itemId: string) => boolean;
  currentUser: typeof MOCK_USERS[0];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [myListings, setMyListings] = useState<Item[]>([]);

  const currentUser = MOCK_USERS[0];

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
  };

  const addListing = (item: Item) => {
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
        toggleFavorite,
        addListing,
        isFavorite,
        currentUser,
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
