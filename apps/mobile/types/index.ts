export type Condition = "New with tags" | "Like new" | "Good" | "Fair";

export type NotificationType =
  | "message"
  | "like"
  | "sale"
  | "price_drop"
  | "order";

export interface Seller {
  id: string;
  name: string;
  bio?: string;
  profileImageUrl?: string;
  rating: number;
  reviewCount: number;
  itemCount: number;
  followersCount: number;
  followingCount: number;
  joinedAt: string;
  verified: boolean;
}

export interface Item {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  size: string;
  condition: Condition;
  category: string;
  images: string[];
  description: string;
  seller: Seller;
  likesCount: number;
  viewsCount: number;
  status?: "available" | "sold";
  postedAt: string;
  color?: string;
}

export interface ConversationItem {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export interface Conversation {
  id: string;
  buyerId: string;
  sellerId: string;
  otherUser: Seller;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  item?: ConversationItem;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  itemId?: string;
}

export interface SellFormData {
  title: string;
  description: string;
  brand: string;
  size: string;
  condition: Condition;
  category: string;
  price: string;
  color: string;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };
