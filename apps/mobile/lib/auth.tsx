import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import {
  api,
  writeAuthTokens,
  wipeAuthTokens,
  JWT_ACCESS_STORE_KEY,
  purgeLegacyAuthStorage,
  API_BASE_FOR_FETCH,
  ApiHttpError,
  type ApiAuthUser,
} from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  sellerStatus: "none" | "pending" | "approved";
  role: "user" | "admin";
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

function toAuthUser(u: ApiAuthUser): AuthUser {
  return {
    id: u.id,
    email: u.email ?? null,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    profileImageUrl: u.profileImageUrl ?? null,
    sellerStatus: u.sellerStatus,
    role: u.role === "admin" ? "admin" : "user",
  };
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  deleteAccount: async () => {},
});

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider(props: Readonly<AuthProviderProps>) {
  const { children } = props;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    await purgeLegacyAuthStorage();
    try {
      const access = await SecureStore.getItemAsync(JWT_ACCESS_STORE_KEY);
      if (!access) {
        setUser(null);
        return;
      }
      const data = await api.auth.user();
      setUser(data.user ? toAuthUser(data.user) : null);
      if (!data.user) await wipeAuthTokens();
    } catch (e) {
      if (e instanceof ApiHttpError && e.status === 401) {
        await wipeAuthTokens();
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim().toLowerCase();
    const res = await api.auth.login({ email: trimmed, password });
    await writeAuthTokens(res.accessToken, res.refreshToken);
    setUser(toAuthUser(res.user));
  }, []);

  const signup = useCallback(
    async (input: { email: string; password: string; firstName?: string; lastName?: string }) => {
      const trimmed = input.email.trim().toLowerCase();
      const res = await api.auth.register({
        email: trimmed,
        password: input.password,
        firstName: input.firstName?.trim() || undefined,
        lastName: input.lastName?.trim() || undefined,
      });
      await writeAuthTokens(res.accessToken, res.refreshToken);
      setUser(toAuthUser(res.user));
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      /* still clear local credentials */
    } finally {
      await wipeAuthTokens();
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await fetchUser();
  }, [fetchUser]);

  const deleteAccount = useCallback(async () => {
    const access = await SecureStore.getItemAsync(JWT_ACCESS_STORE_KEY);
    if (!access) throw new Error("Not authenticated");
    const res = await fetch(`${API_BASE_FOR_FETCH}/users/me`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
    });
    if (!res.ok && res.status !== 204) throw new Error("Account deletion failed");
    await wipeAuthTokens();
    setUser(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      signup,
      logout,
      refreshUser,
      deleteAccount,
    }),
    [user, isLoading, login, signup, logout, refreshUser, deleteAccount],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(JWT_ACCESS_STORE_KEY);
}
