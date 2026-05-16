export interface Item {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  size: string;
  condition: "New with tags" | "Like new" | "Good" | "Fair";
  category: string;
  images: string[];
  description: string;
  seller: User;
  likes: number;
  views: number;
  isLiked?: boolean;
  postedAt: string;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  itemCount: number;
  followersCount: number;
  followingCount: number;
  joinedAt: string;
  verified?: boolean;
  bio?: string;
}

export interface Conversation {
  id: string;
  otherUser: User;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  item?: Pick<Item, "id" | "title" | "price" | "images">;
}

export interface Message {
  id: string;
  text: string;
  sentAt: string;
  isOwn: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export type SellFormData = {
  title: string;
  description: string;
  brand: string;
  size: string;
  condition: Item["condition"];
  category: string;
  price: string;
  color: string;
};
