import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@vinted/onboarding_complete";

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
    },
  },
};
