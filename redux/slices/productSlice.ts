import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Product interface
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  subcategory?: string;
  images: string[];
  stock: number;
  colors?: string[];
  fonts?: string[];
  isTopProduct: boolean;
  isActive: boolean;
  averageRating: number;
  numReviews: number;
}

// Products state interface
interface ProductsState {
  products: Product[];
  topProducts: Product[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  filters: {
    category: string;
    subcategory: string;
    minPrice: number;
    maxPrice: number;
    onSale: boolean;
    sortBy: string;
    search: string;
  };
}

// Initial state
const initialState: ProductsState = {
  products: [],
  topProducts: [],
  currentProduct: null,
  relatedProducts: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
  },
  filters: {
    category: "",
    subcategory: "",
    minPrice: 0,
    maxPrice: 0,
    onSale: false,
    sortBy: "newest",
    search: "",
  },
};

// Fetch products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params: Record<string, string | number | boolean>, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();

      const response = await fetch(`/api/products?${queryString}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to fetch products");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch top products
export const fetchTopProducts = createAsyncThunk(
  "products/fetchTopProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/products?isTopProduct=true&limit=6");
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to fetch top products");
      }

      return data.products;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch single product
export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to fetch product");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Products slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<ProductsState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.relatedProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
        state.isLoading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch top products
      .addCase(fetchTopProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.topProducts = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single product
      .addCase(fetchProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload.product;
        state.relatedProducts = action.payload.relatedProducts || [];
        state.isLoading = false;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectProducts = (state: { products: ProductsState }) =>
  state.products.products;
export const selectTopProducts = (state: { products: ProductsState }) =>
  state.products.topProducts;
export const selectCurrentProduct = (state: { products: ProductsState }) =>
  state.products.currentProduct;
export const selectRelatedProducts = (state: { products: ProductsState }) =>
  state.products.relatedProducts;
export const selectProductsLoading = (state: { products: ProductsState }) =>
  state.products.isLoading;
export const selectProductsError = (state: { products: ProductsState }) =>
  state.products.error;
export const selectPagination = (state: { products: ProductsState }) =>
  state.products.pagination;
export const selectFilters = (state: { products: ProductsState }) =>
  state.products.filters;

export const { setFilters, resetFilters, setPage, clearCurrentProduct } =
  productSlice.actions;
export default productSlice.reducer;

