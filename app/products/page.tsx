"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchProducts,
  selectProducts,
  selectProductsLoading,
  selectPagination,
  setFilters,
  resetFilters,
} from "@/redux/slices/productSlice";
import { ProductCard } from "@/components/ui/ProductCard";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
];

function ProductsPageContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const products = useAppSelector(selectProducts);
  const isLoading = useAppSelector(selectProductsLoading);
  const pagination = useAppSelector(selectPagination);

  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Get filters from URL
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const onSale = searchParams.get("onSale") === "true";
  const isTopProduct = searchParams.get("isTopProduct") === "true";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    dispatch(
      fetchProducts({
        category,
        search,
        onSale,
        isTopProduct,
        sortBy,
        page,
      })
    );
  }, [dispatch, category, search, onSale, isTopProduct, sortBy, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/products?${params.toString()}`);
  };

  const getPageTitle = () => {
    if (search) return `Search: "${search}"`;
    if (onSale) return "On Sale";
    if (isTopProduct) return "Top Products";
    if (category) return category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return "All Products";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            {getPageTitle()}
          </h1>
          <p className="text-gray-500 mt-1">
            {pagination.total} {pagination.total === 1 ? "product" : "products"} found
          </p>
        </div>
      </div>

      <div className="container-custom py-6 md:py-8">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-focus focus:ring-2 focus:ring-focus/30"
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
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:border-focus focus:ring-2 focus:ring-focus/30"
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

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05 } },
              }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="btn btn-secondary py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 text-sm text-gray-500">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="btn btn-secondary py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found</p>
            <button
              onClick={() => router.push("/products")}
              className="btn btn-primary mt-4"
            >
              View All Products...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-custom py-6 md:py-8">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        <div className="container-custom py-6 md:py-8">
          {/* Filters Bar Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
