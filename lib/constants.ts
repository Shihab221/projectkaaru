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
  { label: "Categories", href: "/categories" },
  { label: "Contact", href: "/contact" },
];

