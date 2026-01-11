"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";

interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  images?: any[];
  stock?: number;
  averageRating?: number;
  numReviews?: number;
  isTopProduct?: boolean;
}

interface VirtualizedProductGridProps {
  products: Product[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function VirtualizedProductGrid({
  products,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className = ""
}: VirtualizedProductGridProps) {
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && !loadingMore && onLoadMore) {
          setLoadingMore(true);
          onLoadMore();
          // Reset loading state after a short delay
          setTimeout(() => setLoadingMore(false), 1000);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadingMore, onLoadMore]);

  if (isLoading && products.length === 0) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 ${className}`}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1" />
                <div className="h-8 bg-gray-200 rounded flex-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.02 } },
        }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id || product._id}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ delay: Math.min(index * 0.01, 0.1) }} // Cap delay for performance
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div
          ref={observerTarget}
          className="flex items-center justify-center py-8 mt-8"
        >
          {loadingMore ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading more products...
            </div>
          ) : (
            <div className="w-full h-4" /> // Invisible trigger element
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && products.length > 12 && (
        <div className="text-center py-8 mt-8 text-gray-500">
          <p>You've reached the end of the results</p>
        </div>
      )}
    </div>
  );
}