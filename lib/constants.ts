// App constants
export const APP_NAME = "ProjectKaaru";
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
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#00FF00" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Purple", hex: "#800080" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#808080" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Navy", hex: "#000080" },
  { name: "Teal", hex: "#008080" },
  { name: "Maroon", hex: "#800000" },
  { name: "Olive", hex: "#808000" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Lime", hex: "#00FF00" },
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
  facebook: "https://facebook.com/projectkaaru",
  whatsapp: "https://wa.me/8801712345678",
  linkedin: "https://linkedin.com/company/projectkaaru",
  instagram: "https://instagram.com/projectkaaru",
};

// Navigation links
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

