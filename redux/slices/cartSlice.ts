import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { trackAddToCart } from "@/lib/analytics";

// Cart item interface
export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  image: string;
  quantity: number;
  stock: number;
  size?: string;
  selectedBackgroundColor?: string; // Customer's selected background color
  selectedBorderColor?: string; // Customer's selected border color
  customization?: {
    type: string;
    text?: string;
    [key: string]: any;
  };
}

// Cart state interface
interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const cart = localStorage.getItem("cart");
    const items = cart ? JSON.parse(cart) : [];

    // Validate and clean cart items
    const validItems = items.filter((item: any) => {
      if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
        console.warn("Removing invalid cart item:", item);
        return false;
      }
      return true;
    });

    // If we removed items, save the cleaned cart back
    if (validItems.length !== items.length) {
      console.log(`Cleaned ${items.length - validItems.length} invalid cart items`);
      saveCartToStorage(validItems);
    }

    return validItems;
  } catch (error) {
    console.error("Error loading cart from storage:", error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cart", JSON.stringify(items));
};

// Initial state
const initialState: CartState = {
  items: [],
  isOpen: false,
};

// Cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Initialize cart from localStorage
    initializeCart: (state) => {
      const items = loadCartFromStorage();
      state.items = items;
    },

    // Add item to cart
    addToCart: (state, action: PayloadAction<CartItem>) => {
      if (!action.payload.id || typeof action.payload.id !== 'string' || action.payload.id.trim() === '') {
        console.error("Cannot add item to cart: invalid ID", action.payload);
        return;
      }

      const existingIndex = state.items.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.size === action.payload.size &&
          item.selectedBackgroundColor === action.payload.selectedBackgroundColor &&
          item.selectedBorderColor === action.payload.selectedBorderColor
      );

      const item = action.payload;
      const finalQuantity = existingIndex >= 0
        ? Math.min(state.items[existingIndex].quantity + item.quantity, item.stock)
        : item.quantity;

      if (existingIndex >= 0) {
        // Update quantity if item exists
        state.items[existingIndex].quantity = finalQuantity;
      } else {
        // Add new item
        state.items.push(action.payload);
      }

      saveCartToStorage(state.items);

      // Track AddToCart event
      if (typeof window !== "undefined") {
        const price = item.discountedPrice || item.price;
        trackAddToCart(
          price * item.quantity,
          "BDT",
          item.id,
          item.name,
          undefined, // category - can be enhanced later
          item.quantity
        );
      }
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<{ id: string; size?: string; selectedBackgroundColor?: string; selectedBorderColor?: string }>) => {
      state.items = state.items.filter(
        (item) =>
          !(item.id === action.payload.id &&
            item.size === action.payload.size &&
            item.selectedBackgroundColor === action.payload.selectedBackgroundColor &&
            item.selectedBorderColor === action.payload.selectedBorderColor)
      );
      saveCartToStorage(state.items);
    },

    // Update item quantity
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; size?: string; selectedBackgroundColor?: string; selectedBorderColor?: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.size === action.payload.size &&
          item.selectedBackgroundColor === action.payload.selectedBackgroundColor &&
          item.selectedBorderColor === action.payload.selectedBorderColor
      );

      if (item) {
        item.quantity = Math.max(1, Math.min(action.payload.quantity, item.stock));
        saveCartToStorage(state.items);
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },

    // Toggle cart sidebar
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    // Open cart sidebar
    openCart: (state) => {
      state.isOpen = true;
    },

    // Close cart sidebar
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartItemsCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (total, item) => total + (item.discountedPrice || item.price) * item.quantity,
    0
  );
export const selectIsCartOpen = (state: { cart: CartState }) => state.cart.isOpen;

export const {
  initializeCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;

