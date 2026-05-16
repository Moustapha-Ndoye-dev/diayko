import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@vinted/onboarding_complete";
const INTERESTS_KEY = "@vinted/interests";
const SELLER_STATUS_KEY = "@vinted/seller_status";

export type SellerStatus = "none" | "pending" | "approved";

function isSellerStatus(value: unknown): value is SellerStatus {
  return value === "none" || value === "pending" || value === "approved";
}

export const storage = {
  onboarding: {
    isComplete: async (): Promise<boolean> => {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      return value === "true";
    },
    setComplete: async (): Promise<void> => {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    },
    reset: async (): Promise<void> => {
      await AsyncStorage.multiRemove([
        ONBOARDING_KEY,
        INTERESTS_KEY,
        SELLER_STATUS_KEY,
      ]);
    },
  },
  interests: {
    get: async (): Promise<string[]> => {
      const raw = await AsyncStorage.getItem(INTERESTS_KEY);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
          ? parsed.filter((x): x is string => typeof x === "string")
          : [];
      } catch {
        return [];
      }
    },
    set: async (interests: string[]): Promise<void> => {
      await AsyncStorage.setItem(INTERESTS_KEY, JSON.stringify(interests));
    },
  },
  sellerStatus: {
    get: async (): Promise<SellerStatus> => {
      const raw = await AsyncStorage.getItem(SELLER_STATUS_KEY);
      return isSellerStatus(raw) ? raw : "none";
    },
    set: async (status: SellerStatus): Promise<void> => {
      await AsyncStorage.setItem(SELLER_STATUS_KEY, status);
    },
  },
};
