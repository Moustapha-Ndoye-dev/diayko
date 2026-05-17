import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "auth_session_token";

const BASE =
  typeof __DEV__ !== "undefined" && __DEV__
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
    : `/api`;

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE}${path}`;
  const authHeader = await getAuthHeader();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

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
export type ApiPaymentMethod = "wave" | "orange_money" | "free_money";

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
  createdAt: string;
  item: ApiItem;
};

export type ApiOrderDetail = ApiOrder & {
  seller: ApiUser;
  events: ApiOrderEvent[];
};

export const api = {
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
    }) => {
      const qs = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== "" && v !== "all") qs.set(k, String(v));
        });
      }
      const query = qs.toString();
      return request<ApiItemListResponse>(`/items${query ? `?${query}` : ""}`);
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
    delete: (id: string) => request<void>(`/items/${id}`, { method: "DELETE" }),
    view: (id: string) =>
      request<{ viewsCount: number }>(`/items/${id}/view`, { method: "POST" }),
    like: (id: string) =>
      request<{ liked: boolean; likesCount: number }>(`/items/${id}/like`, {
        method: "POST",
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
      return request<ApiItemListResponse>(`/users/${id}/items${query ? `?${query}` : ""}`);
    },
    favorites: (id: string) =>
      request<{ items: ApiItem[]; ids: string[] }>(`/users/${id}/favorites`),
  },
  categories: {
    list: () =>
      request<{ id: string; label: string; icon: string }[]>("/categories"),
  },
  sellerAccess: {
    request: () =>
      request<{ sellerStatus: string }>("/users/me/seller-access", { method: "POST" }),
    approve: () =>
      request<{ sellerStatus: string }>("/users/me/seller-access/approve", { method: "POST" }),
    reset: () =>
      request<{ sellerStatus: string }>("/users/me/seller-access/reset", { method: "POST" }),
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
    messages: (id: string) =>
      request<ApiMessage[]>(`/conversations/${id}/messages`),
    send: (id: string, body: { text: string }) =>
      request<ApiMessage>(`/conversations/${id}/messages`, {
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
      return request<{ orders: ApiOrder[] }>(`/orders${query ? `?${query}` : ""}`);
    },
    get: (id: string) => request<ApiOrderDetail>(`/orders/${id}`),
    create: (body: {
      buyerId: string;
      itemId: string;
      paymentMethod: ApiPaymentMethod;
      carrier?: string;
    }) =>
      request<ApiOrder>("/orders", { method: "POST", body: JSON.stringify(body) }),
    updateStatus: (id: string, status: ApiOrderStatus) =>
      request<ApiOrder>(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },
};
