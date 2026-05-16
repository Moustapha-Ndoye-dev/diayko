import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@vinted/onboarding_complete";
const INTERESTS_KEY = "@vinted/interests";

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
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      await AsyncStorage.removeItem(INTERESTS_KEY);
    },
  },
  interests: {
    get: async (): Promise<string[]> => {
      const raw = await AsyncStorage.getItem(INTERESTS_KEY);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
      } catch {
        return [];
      }
    },
    set: async (interests: string[]): Promise<void> => {
      await AsyncStorage.setItem(INTERESTS_KEY, JSON.stringify(interests));
    },
  },
};
