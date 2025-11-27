import { Product } from "@/types";

export const products: Product[] = [
  // Earrings
  { id: 1, name: "Classic Gold Hoops", price: 89, category: "earrings", tag: "Best seller" },
  { id: 2, name: "Pearl Drop Earrings", price: 129, category: "earrings", tag: "New" },
  { id: 3, name: "Minimalist Studs", price: 69, category: "earrings", tag: "Budget pick" },
  { id: 4, name: "Geometric Hoops", price: 99, category: "earrings", tag: "Popular" },
  { id: 5, name: "Dainty Chain Drops", price: 109, category: "earrings", tag: "New" },
  { id: 6, name: "Stacked Ring Set", price: 149, category: "earrings", tag: "Best seller" },
  { id: 7, name: "Small Gold Hoops", price: 79, category: "earrings", tag: "Budget pick" },
  { id: 8, name: "Crystal Studs", price: 94, category: "earrings", tag: "New" },
  { id: 9, name: "Huggie Hoops", price: 89, category: "earrings", tag: "Popular" },
  { id: 10, name: "Threader Earrings", price: 119, category: "earrings", tag: "Trending" },
  
  // Cap
  { id: 11, name: "Classic Beanie Cap", price: 99, category: "cap", tag: "Best seller" },
  { id: 12, name: "Baseball Cap", price: 129, category: "cap", tag: "New" },
  { id: 13, name: "Bucket Hat", price: 89, category: "cap", tag: "Budget pick" },
  { id: 14, name: "Wool Winter Cap", price: 149, category: "cap", tag: "Popular" },
  { id: 15, name: "Minimalist Snapback", price: 109, category: "cap", tag: "New" },
  { id: 16, name: "Cozy Knit Cap", price: 79, category: "cap", tag: "Budget pick" },
  { id: 17, name: "Summer Sun Hat", price: 119, category: "cap", tag: "Popular" },
  { id: 18, name: "Sporty Cap", price: 94, category: "cap", tag: "New" },
  
  // Glooves
  { id: 19, name: "Classic Wool Gloves", price: 89, category: "glooves", tag: "Best seller" },
  { id: 20, name: "Touchscreen Gloves", price: 109, category: "glooves", tag: "New" },
  { id: 21, name: "Fingerless Gloves", price: 69, category: "glooves", tag: "Budget pick" },
  { id: 22, name: "Leather Gloves", price: 149, category: "glooves", tag: "Popular" },
  { id: 23, name: "Cozy Mittens", price: 79, category: "glooves", tag: "New" },
  { id: 24, name: "Cashmere Gloves", price: 129, category: "glooves", tag: "Popular" },
  { id: 25, name: "Sport Gloves", price: 94, category: "glooves", tag: "Budget pick" },
  { id: 26, name: "Knit Gloves Set", price: 99, category: "glooves", tag: "New" },
  
  // Keyring
  { id: 27, name: "Minimalist Keyring", price: 49, category: "keyring", tag: "Budget pick" },
  { id: 28, name: "Leather Key Fob", price: 69, category: "keyring", tag: "New" },
  { id: 29, name: "Charm Keyring", price: 59, category: "keyring", tag: "Popular" },
  { id: 30, name: "Metal Keychain", price: 79, category: "keyring", tag: "Best seller" },
  { id: 31, name: "Cute Animal Keyring", price: 64, category: "keyring", tag: "New" },
  { id: 32, name: "Personalized Keyring", price: 89, category: "keyring", tag: "Popular" },
  { id: 33, name: "Vintage Key Fob", price: 74, category: "keyring", tag: "Budget pick" },
  { id: 34, name: "Designer Keyring", price: 99, category: "keyring", tag: "New" },
];

export const categories = [
  {
    id: "earrings",
    name: "Earrings",
    description: "Everyday hoops and studs",
    slug: "/earrings",
    icon: "○",
  },
  {
    id: "cap",
    name: "Cap",
    description: "Caps and hats for every mood",
    slug: "/cap",
    icon: "🧢",
  },
  {
    id: "glooves",
    name: "Glooves",
    description: "Cozy and stylish handwear",
    slug: "/glooves",
    icon: "🧤",
  },
  {
    id: "keyring",
    name: "Keyring",
    description: "Keep your keys cute and organized",
    slug: "/keyring",
    icon: "🔑",
  },
];
