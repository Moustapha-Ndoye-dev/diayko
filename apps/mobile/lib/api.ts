import * as SecureStore from "expo-secure-store";

const LEGACY_AUTH_TOKEN_KEY = "auth_session_token";

export const JWT_ACCESS_STORE_KEY = "diayko_jwt_access";
export const JWT_REFRESH_STORE_KEY = "diayko_jwt_refresh";

function getApiOrigin(): string {
  if (process.env.EXPO_PUBLIC_API_ORIGIN) {
    return process.env.EXPO_PUBLIC_API_ORIGIN.replace(/\/$/, "");
  }
  if (typeof __DEV__ !== "undefined" && __DEV__ && process.env.EXPO_PUBLIC_DOMAIN) {
    return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  }
  return "";
}

const BASE =
  typeof __DEV__ !== "undefined" && __DEV__
    ? `${getApiOrigin()}/api`
    : "/api";

/** Same prefix used by `api.*` for non-`api` fetch calls (e.g. account deletion). */
export const API_BASE_FOR_FETCH = BASE;

export class ApiHttpError extends Error {
  readonly status: number;
  readonly bodyText: string;

  constructor(status: number, bodyText: string) {
    super(`API ${status}: ${bodyText}`);
    this.name = "ApiHttpError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

let refreshSingleton: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  refreshSingleton ??= doRefreshTokens().finally(() => {
    refreshSingleton = null;
  });
  return refreshSingleton;
}

async function doRefreshTokens(): Promise<boolean> {
  try {
    const rt = await SecureStore.getItemAsync(JWT_REFRESH_STORE_KEY);
    if (!rt) return false;
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    await writeAuthTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function writeAuthTokens(access: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(JWT_ACCESS_STORE_KEY, access);
  await SecureStore.setItemAsync(JWT_REFRESH_STORE_KEY, refresh);
}

export async function wipeAuthTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(JWT_ACCESS_STORE_KEY).catch(() => undefined);
  await SecureStore.deleteItemAsync(JWT_REFRESH_STORE_KEY).catch(() => undefined);
  await SecureStore.deleteItemAsync(LEGACY_AUTH_TOKEN_KEY).catch(() => undefined);
}

export async function purgeLegacyAuthStorage(): Promise<void> {
  await SecureStore.deleteItemAsync(LEGACY_AUTH_TOKEN_KEY).catch(() => undefined);
}

async function getBearerHeader(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync(JWT_ACCESS_STORE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function skipRefreshOn401(path: string): boolean {
  return (
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/refresh")
  );
}

function pathWithQuery(path: string, query: string): string {
  return query ? `${path}?${query}` : path;
}

async function request<T>(path: string, options?: RequestInit, hasRetried = false): Promise<T> {
  const url = `${BASE}${path}`;
  const bearer = await getBearerHeader();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...bearer,
      ...options?.headers,
    },
  });

  if (res.status === 401 && !hasRetried && !skipRefreshOn401(path)) {
    const rt = await SecureStore.getItemAsync(JWT_REFRESH_STORE_KEY);
    if (rt) {
      const ok = await refreshAccessToken();
      if (ok) return request<T>(path, options, true);
    }
  }

  if (!res.ok) {
    const body = await res.text();
    throw new ApiHttpError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type ApiAuthUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  sellerStatus: "none" | "pending" | "approved";
  role: "user" | "admin";
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: ApiAuthUser;
};

export type ApiItem = {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  size: string;
  condition: "New with tags" | "Like new" | "Good" | "Fair";
  category: string;
  description: string;
  color?: string | null;
  sellerId: string;
  likesCount: number;
  viewsCount: number;
  status?: "available" | "sold";
  images: string[];
  createdAt: string;
  seller?: ApiUser;
};

export type ApiUser = {
  id: string;
  name?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
  rating: number;
  reviewCount: number;
  itemCount: number;
  followersCount: number;
  followingCount: number;
  verified: boolean;
  createdAt: string;
};

export type ApiItemListResponse = {
  items: ApiItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type ApiConversation = {
  id: string;
  buyerId: string;
  sellerId: string;
  itemId?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  otherUser?: ApiUser | null;
  item?: ApiItem | null;
  createdAt: string;
};

export type ApiMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type ApiOrderStatus = "processing" | "in_transit" | "delivered" | "cancelled";
export type ApiPaymentMethod = "wave" | "orange_money" | "free_money" | "cash";

export type ApiOrderEvent = {
  id: string;
  orderId: string;
  label: string;
  position: number;
  done: boolean;
  occurredAt?: string | null;
};

export type ApiOrder = {
  id: string;
  buyerId: string;
  sellerId: string;
  itemId: string;
  totalPrice: string;
  status: ApiOrderStatus;
  paymentMethod: ApiPaymentMethod;
  carrier?: string | null;
  trackingId?: string | null;
  eta?: string | null;
  deliveryAddress?: {
    name: string;
    city: string;
    phone: string;
    line1: string;
  } | null;
  createdAt: string;
  item: ApiItem;
};

export type ApiOrderDetail = ApiOrder & {
  seller: ApiUser;
  events: ApiOrderEvent[];
};

export type ApiReview = {
  id: string;
  orderId: string;
  reviewerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type ApiCheckoutQuote = {
  subtotal: number;
  serviceFee: number;
  total: number;
  currency: "XOF";
};

export type ApiNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type ApiWallet = {
  currency: "XOF";
  available: number;
  pending: number;
};

export type ApiWalletTransaction = {
  id: string;
  type: "credit" | "debit";
  label: string;
  amount: number;
  method: string;
  status?: string;
  createdAt: string;
};

export type ApiSellerStats = {
  views: number;
  likes: number;
};

export const api = {
  auth: {
    register: (body: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) =>
      request<AuthTokensResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<AuthTokensResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    user: () => request<{ user: ApiAuthUser | null }>("/auth/user"),
    logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST", body: JSON.stringify({}) }),
  },

  admin: {
    setSellerStatus: (userId: string, sellerStatus: "none" | "pending" | "approved") =>
      request<{ sellerStatus: string }>(`/admin/users/${userId}/seller-status`, {
        method: "POST",
        body: JSON.stringify({ sellerStatus }),
      }),
  },

  items: {
    list: (params?: {
      category?: string;
      q?: string;
      size?: string;
      condition?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      limit?: number;
      sort?: "price_asc" | "newest";
    }) => {
      const qs = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== "" && v !== "all") qs.set(k, String(v));
        });
      }
      const query = qs.toString();
      return request<ApiItemListResponse>(pathWithQuery("/items", query));
    },
    get: (id: string) => request<ApiItem>(`/items/${id}`),
    create: (body: {
      title: string;
      brand: string;
      price: number;
      originalPrice?: number | null;
      size: string;
      condition: string;
      category: string;
      description: string;
      color?: string | null;
      images: string[];
    }) => request<ApiItem>("/items", { method: "POST", body: JSON.stringify(body) }),
    patch: (
      id: string,
      body: Partial<{
        title: string;
        brand: string;
        price: number;
        originalPrice?: number | null;
        size: string;
        condition: string;
        category: string;
        description: string;
        color?: string | null;
        images: string[];
      }>,
    ) =>
      request<ApiItem>(`/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: (id: string) => request<void>(`/items/${id}`, { method: "DELETE" }),
    view: (id: string) =>
      request<{ viewsCount: number }>(`/items/${id}/view`, { method: "POST", body: JSON.stringify({}) }),
    like: (id: string) =>
      request<{ liked: boolean; likesCount: number }>(`/items/${id}/like`, {
        method: "POST",
      }),
    status: (id: string, status: "available" | "sold") =>
      request<ApiItem>(`/items/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },

  users: {
    create: (body: { name: string; bio?: string }) =>
      request<ApiUser>("/users", { method: "POST", body: JSON.stringify(body) }),
    get: (id: string) => request<ApiUser>(`/users/${id}`),
    update: (id: string, body: { name?: string; bio?: string | null }) =>
      request<ApiUser>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    items: (id: string, params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      const query = qs.toString();
      return request<ApiItemListResponse>(pathWithQuery(`/users/${id}/items`, query));
    },
    reviews: (id: string, params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      const query = qs.toString();
      return request<{
        reviews: ApiReview[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      }>(pathWithQuery(`/users/${id}/reviews`, query));
    },
  },

  favorites: {
    list: () => request<{ items: ApiItem[]; ids: string[] }>("/me/favorites"),
  },

  categories: {
    list: () => request<{ id: string; label: string; icon: string }[]>("/categories"),
  },

  sellerAccess: {
    request: () =>
      request<{ sellerStatus: string }>("/users/me/seller-access", { method: "POST", body: JSON.stringify({}) }),
    reset: () =>
      request<{ sellerStatus: string }>("/users/me/seller-access/reset", { method: "POST", body: JSON.stringify({}) }),
  },

  conversations: {
    list: () => request<ApiConversation[]>("/conversations"),
    create: (body: {
      sellerId: string;
      itemId?: string | null;
      initialMessage?: string;
    }) =>
      request<ApiConversation>("/conversations", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    messages: (id: string, params?: { limit?: number; before?: string }) => {
      const qs = new URLSearchParams();
      if (params?.limit != null) qs.set("limit", String(params.limit));
      if (params?.before) qs.set("before", params.before);
      const query = qs.toString();
      return request<ApiMessage[]>(pathWithQuery(`/conversations/${id}/messages`, query));
    },
    send: (id: string, body: { text: string }) =>
      request<ApiMessage>(`/conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    read: (id: string) =>
      request<{ unreadCount: number }>(`/conversations/${id}/read`, {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
    report: (id: string, body: { reason: string; details?: string | null }) =>
      request<{ id: string; reason: string }>(`/conversations/${id}/report`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  orders: {
    list: (params?: { status?: ApiOrderStatus; role?: "buyer" | "seller" | "any" }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.role) qs.set("role", params.role);
      const query = qs.toString();
      return request<{ orders: ApiOrder[] }>(pathWithQuery("/orders", query));
    },
    get: (id: string) => request<ApiOrderDetail>(`/orders/${id}`),
    create: (body: {
      itemId: string;
      paymentMethod: ApiPaymentMethod;
      carrier?: string;
      deliveryAddress?: {
        name: string;
        city: string;
        phone: string;
        line1: string;
      };
    }) =>
      request<ApiOrder>("/orders", { method: "POST", body: JSON.stringify(body) }),
    updateStatus: (id: string, status: ApiOrderStatus) =>
      request<ApiOrder>(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    cancel: (id: string) =>
      request<ApiOrder>(`/orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    confirmReceipt: (id: string) =>
      request<ApiOrder>(`/orders/${id}/confirm-receipt`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    createReview: (orderId: string, body: { rating: number; comment?: string | null }) =>
      request<ApiReview>(`/orders/${orderId}/reviews`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  checkout: {
    quote: (body: { itemId: string; paymentMethod: ApiPaymentMethod }) =>
      request<ApiCheckoutQuote>("/checkout/quote", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  notifications: {
    list: () => request<{ notifications: ApiNotification[] }>("/notifications"),
    read: (id: string) =>
      request<ApiNotification>(`/notifications/${id}/read`, {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
    markAllRead: () =>
      request<{ unread: number }>("/notifications/mark-all-read", {
        method: "POST",
        body: JSON.stringify({}),
      }),
  },

  wallet: {
    get: () => request<ApiWallet>("/wallet"),
    transactions: () =>
      request<{ transactions: ApiWalletTransaction[] }>("/wallet/transactions"),
    withdraw: (body: { amount: number; method: string; phone: string }) =>
      request<{ id: string; status: string }>("/wallet/withdrawals", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  seller: {
    stats: () => request<ApiSellerStats>("/seller/stats"),
    sales: () => request<{ orders: ApiOrder[] }>("/me/sales"),
  },
};
