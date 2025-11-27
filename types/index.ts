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
  imageUrl: string;
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


