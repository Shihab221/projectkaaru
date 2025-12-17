import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Cart item interface
export interface CartItem {
  _id: string;
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
    return cart ? JSON.parse(cart) : [];
  } catch {
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
      state.items = loadCartFromStorage();
    },

    // Add item to cart
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item._id === action.payload._id &&
          item.size === action.payload.size &&
          item.selectedBackgroundColor === action.payload.selectedBackgroundColor &&
          item.selectedBorderColor === action.payload.selectedBorderColor
      );

      if (existingIndex >= 0) {
        // Update quantity if item exists
        const newQuantity = state.items[existingIndex].quantity + action.payload.quantity;
        state.items[existingIndex].quantity = Math.min(newQuantity, action.payload.stock);
      } else {
        // Add new item
        state.items.push(action.payload);
      }

      saveCartToStorage(state.items);
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<{ _id: string; size?: string; selectedBackgroundColor?: string; selectedBorderColor?: string }>) => {
      state.items = state.items.filter(
        (item) =>
          !(item._id === action.payload._id &&
            item.size === action.payload.size &&
            item.selectedBackgroundColor === action.payload.selectedBackgroundColor &&
            item.selectedBorderColor === action.payload.selectedBorderColor)
      );
      saveCartToStorage(state.items);
    },

    // Update item quantity
    updateQuantity: (
      state,
      action: PayloadAction<{ _id: string; size?: string; selectedBackgroundColor?: string; selectedBorderColor?: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) =>
          item._id === action.payload._id &&
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

