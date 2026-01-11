"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, SlidersHorizontal, X, ChevronDown, Search, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchProducts,
  selectProducts,
  selectProductsLoading,
  selectPagination,
  setFilters,
  resetFilters,
} from "@/redux/slices/productSlice";
import { VirtualizedProductGrid } from "@/components/products/VirtualizedProductGrid";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
];

export function ProductsPageContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const products = useAppSelector(selectProducts);
  const isLoading = useAppSelector(selectProductsLoading);
  const pagination = useAppSelector(selectPagination);

  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isSearching, setIsSearching] = useState(false);

  // Infinite scroll state
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get filters from URL
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const onSale = searchParams.get("onSale") === "true";
  const isTopProduct = searchParams.get("isTopProduct") === "true";

  // Reset infinite scroll when filters change
  useEffect(() => {
    setAllProducts([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [category, search, onSale, isTopProduct, sortBy]);

  // Load initial products
  useEffect(() => {
    if (allProducts.length === 0 && !isLoading) {
      dispatch(
        fetchProducts({
          category,
          search,
          onSale,
          isTopProduct,
          sortBy,
          page: 1,
        })
      );
    }
  }, [dispatch, category, search, onSale, isTopProduct, sortBy, allProducts.length, isLoading]);

  // Update allProducts when new products are loaded
  useEffect(() => {
    if (products.length > 0) {
      if (currentPage === 1) {
        setAllProducts(products);
      } else {
        setAllProducts(prev => {
          // Avoid duplicates by checking IDs
          const existingIds = new Set(prev.map(p => p.id || p._id));
          const newProducts = products.filter(p => !existingIds.has(p.id || p._id));
          return [...prev, ...newProducts];
        });
      }
      setHasMore(products.length === 12); // Assuming 12 products per page
    }
  }, [products, currentPage]);

  // Infinite scroll load more function
  const loadMoreProducts = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

      dispatch(
        fetchProducts({
          category,
          search,
          onSale,
          isTopProduct,
          sortBy,
          page: nextPage,
        })
      ).finally(() => {
        setIsLoadingMore(false);
      });
    }
  }, [dispatch, category, search, onSale, isTopProduct, sortBy, currentPage, hasMore, isLoading, isLoadingMore]);

  // Debounced search to prevent excessive API calls
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      } else {
        params.delete("search");
      }
      router.replace(`/products?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, search, searchParams, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    if (localSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(localSearch.trim())}`);
    }
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to first page when sorting
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const getPageTitle = () => {
    if (search) return `Search: "${search}"`;
    if (onSale) return "On Sale";
    if (isTopProduct) return "Top Products";
    if (category) return category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return "All Products";
  };

  // Memoized pagination controls for fallback navigation
  const paginationControls = useMemo(() => {
    if (pagination.totalPages <= 1) return null;

    const controls = [];
    const totalPages = Math.ceil(allProducts.length / 12); // Assuming 12 products per page

    // Previous button
    controls.push(
      <button
        key="prev"
        onClick={() => {
          const newPage = Math.max(1, Math.floor(allProducts.length / 12) - 1);
          setCurrentPage(newPage);
          setAllProducts([]);
          dispatch(fetchProducts({
            category, search, onSale, isTopProduct, sortBy, page: newPage
          }));
        }}
        disabled={currentPage <= 1}
        className="btn btn-secondary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    // Simple page indicator
    controls.push(
      <span key="page-info" className="px-4 text-sm text-gray-500">
        Loaded {allProducts.length} products
      </span>
    );

    // Load more button (as alternative to next page)
    if (hasMore) {
      controls.push(
        <button
          key="load-more"
          onClick={loadMoreProducts}
          disabled={isLoadingMore}
          className="btn btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingMore ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Load More'
          )}
        </button>
      );
    }

    return controls;
  }, [allProducts.length, currentPage, hasMore, isLoadingMore, loadMoreProducts, dispatch, category, search, onSale, isTopProduct, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            {getPageTitle()}
          </h1>
          <p className="text-gray-500 mt-1">
            {isLoading && allProducts.length === 0 ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading products...
              </span>
            ) : (
              `${allProducts.length.toLocaleString()}${hasMore ? '+' : ''} ${allProducts.length === 1 ? "product" : "products"} found`
            )}
          </p>
        </div>
      </div>

      <div className="container-custom py-6 md:py-8">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              )}
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn btn-secondary py-2"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(category || onSale || isTopProduct || search) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-500">Active filters:</span>
            {category && (
              <span className="badge badge-primary flex items-center gap-1">
                {category.split("-").join(" ")}
                <button onClick={() => router.push("/products")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {onSale && (
              <span className="badge badge-error flex items-center gap-1">
                On Sale
                <button onClick={() => router.push("/products")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {isTopProduct && (
              <span className="badge badge-warning flex items-center gap-1">
                Top Products
                <button onClick={() => router.push("/products")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="badge badge-primary flex items-center gap-1">
                "{search}"
                <button onClick={() => router.push("/products")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => router.push("/products")}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Products Grid with Infinite Scroll */}
        <VirtualizedProductGrid
          products={allProducts}
          isLoading={isLoading && allProducts.length === 0}
          hasMore={hasMore}
          onLoadMore={loadMoreProducts}
        />

        {/* Traditional pagination fallback for SEO and accessibility */}
        {allProducts.length > 0 && !hasMore && pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 border-t pt-8">
            <span className="text-sm text-gray-500 mr-4">
              Page navigation:
            </span>
            {paginationControls}
          </div>
        )}

        {allProducts.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                {search
                  ? `No products match "${search}". Try different keywords or browse all products.`
                  : "No products are available in this category right now."
                }
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push("/products")}
                  className="btn btn-primary"
                >
                  View All Products
                </button>
                {search && (
                  <button
                    onClick={() => setLocalSearch("")}
                    className="btn btn-secondary"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}