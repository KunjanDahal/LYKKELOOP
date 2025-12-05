export type ProductType = "earrings" | "cap" | "glooves" | "keyring";

// Legacy Product interface for backward compatibility with existing components
export interface Product {
  id: number;
  name: string;
  price: number;
  category: "earrings" | "cap" | "glooves" | "keyring";
  tag?: string;
  image?: string;
}

// New Product interface for database products
export interface DbProduct {
  _id: string;
  name: string;
  type: ProductType;
  priceDkk: number;
  imageUrl?: string;
  images?: string[];
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
}

// Messaging Types
export interface IConversation {
  _id: string;
  userId: string;
  adminId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastMessageSnippet: string;
  lastMessageAt: Date;
  userUnreadCount: number;
  adminUnreadCount: number;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId?: string | null;
  senderRole: "user" | "admin";
  content: string;
  createdAt: Date;
  readAt: Date | null;
}

// API Response Types
export interface ConversationResponse {
  id: string;
  userId: string;
  adminId?: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageSnippet: string;
  lastMessageAt: string;
  userUnreadCount: number;
  adminUnreadCount: number;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId?: string | null;
  senderRole: "user" | "admin";
  content: string;
  createdAt: string;
  readAt: string | null;
}

export interface ConversationWithMessagesResponse extends ConversationResponse {
  messages: MessageResponse[];
}


