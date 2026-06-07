// App constants
export const APP_NAME = "ProjectKaru";
export const APP_DESCRIPTION = "Custom 3D Printed Wonders - Home Decor, Keychains, Organizers & More";

// Default categories (seeded in DB)
export const DEFAULT_CATEGORIES = [
  {
    name: "Home Decor",
    slug: "home-decor",
    subcategories: ["Wall Art", "Vases", "Figurines", "Planters"],
    image: "/images/categories/home-decor.jpg",
  },
  {
    name: "Key Chains",
    slug: "key-chains",
    subcategories: ["Custom Name", "Character", "Logo", "Minimalist"],
    image: "/images/categories/keychains.jpg",
  },
  {
    name: "Organizer",
    slug: "organizer",
    subcategories: ["Desk Organizer", "Cable Management", "Storage Box", "Pen Holder"],
    image: "/images/categories/organizer.jpg",
  },
  {
    name: "Others",
    slug: "others",
    subcategories: ["Gifts", "Tech Accessories", "Office", "Kitchen"],
    image: "/images/categories/others.jpg",
  },
];

// Special categories (auto-generated)
export const SPECIAL_CATEGORIES = {
  TOP_PRODUCTS: "top-products",
  ON_SALE: "on-sale",
};

// Order statuses
export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

// User roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

// Keychain category YouTube Short (shown on product detail page)
export const KEYCHAIN_YOUTUBE_SHORT_URL =
  "https://www.youtube.com/shorts/BQnQD9ScBes";

export const KEYCHAIN_CATEGORY_SLUG = "key-chains";

// Keychain colors
export const KEYCHAIN_COLORS = [
  { name: "Yellow", hex: "#F4EE2A" },
  { name: "Magenta", hex: "#EC008C" },
  { name: "Cyan", hex: "#0086D6" },
  { name: "Orange", hex: "#FF6A13" },
  { name: "Red", hex: "#C12E1F" },
  { name: "Lime Green", hex: "#00AE42" },
  { name: "Pink", hex: "#F55A74" },
  { name: "Pumpkin", hex: "#FF9016" },
  { name: "Indigo", hex: "#482960" },
  { name: "Green", hex: "#002914" },
  { name: "Dark Blue", hex: "#042F56" },
  { name: "Lilac Purple", hex: "#AE96D4" },
  { name: "Dark Chocolate", hex: "#4D3324" },
  { name: "Black", hex: "#000000" },
  { name: "Ivory White", hex: "#FFFFFF" },
  { name: "Sakura Pink", hex: "#E8AFCF" },
  { name: "Sky Blue", hex: "#56B7E6" },
  { name: "Beige", hex: "#F7E6DE" },
  { name: "Latte Brown", hex: "#D3B7A7" },
  { name: "Gold", hex: "#E4BD68" },
  { name: "Silver", hex: "#A6A9AA" },
  { name: "Grey", hex: "#8E9089" },
  { name: "Purple", hex: "#6A3D8F" },
  { name: "Blue", hex: "#1B2A6B" },
];

export const FONT_OPTIONS = [
  "Arial",
  "Verdana",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Palatino",
  "Garamond",
  "Bookman",
  "Comic Sans MS",
];

// Delivery / courier charges (BDT)
export type DeliveryZone = "inside_dhaka" | "outside_dhaka";

export const DELIVERY_OPTIONS: {
  id: DeliveryZone;
  label: string;
  description: string;
  charge: number;
}[] = [
  {
    id: "inside_dhaka",
    label: "Inside Dhaka",
    description: "Delivery within Dhaka city",
    charge: 60,
  },
  {
    id: "outside_dhaka",
    label: "Outside Dhaka",
    description: "Delivery outside Dhaka city",
    charge: 110,
  },
];

export const DELIVERY_SHIPPING_COSTS: Record<DeliveryZone, number> = {
  inside_dhaka: 60,
  outside_dhaka: 110,
};

export function getShippingCostForZone(zone: DeliveryZone): number {
  return DELIVERY_SHIPPING_COSTS[zone];
}

export const PAYMENT_ACCOUNTS = {
  bkash: "01776603125",
  nagad: "01608144956",
} as const;

// Pagination
export const PRODUCTS_PER_PAGE = 12;
export const ORDERS_PER_PAGE = 10;

// Social links
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/projectkaru2025",
  whatsapp: "https://wa.me/8801712345678",
  linkedin: "https://linkedin.com/company/projectkaru",
  instagram: "https://instagram.com/projectkaru",
};

// Navigation links
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "CAD & 3D Print", href: "/cad-3d-print" },
  { label: "Tutorial", href: "/tutorial" },
  { label: "Contact", href: "/contact" },
];

