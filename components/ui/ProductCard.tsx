"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Zap, Star } from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { addToCart, openCart, clearCart } from "@/redux/slices/cartSlice";
import { formatPrice, calculateDiscount, truncateText } from "@/lib/utils";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    price: number;
    discountedPrice?: number;
    images: any[]; // Array of image objects from Prisma
    stock: number;
    averageRating?: number;
    numReviews?: number;
    isTopProduct?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();

  // Validate product data
  if (!product || !product.id || !product.name || !product.slug) {
    console.error("Invalid product data:", product);
    return null; // Don't render invalid products
  }

  const isOnSale = product.discountedPrice && product.discountedPrice < product.price;
  const discount = isOnSale
    ? calculateDiscount(product.price, product.discountedPrice!)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock < 1) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      dispatch(
        addToCart({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          discountedPrice: product.discountedPrice,
          image: (product.images && product.images.length > 0 && product.id) ? `/api/images/${product.id}/0` : "",
          quantity: 1,
          stock: product.stock,
        })
      );
      dispatch(openCart());
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock < 1) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      // Clear cart first, then add this product
      dispatch(clearCart());
      dispatch(
        addToCart({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          discountedPrice: product.discountedPrice,
          image: (product.images && product.images.length > 0 && product.id) ? `/api/images/${product.id}/0` : "",
          quantity: 1,
          stock: product.stock,
        })
      );

      // Small delay to ensure cart operation completes before redirect
      setTimeout(() => {
        window.location.href = "/checkout";
      }, 100);
    } catch (error) {
      console.error("Error with Buy Now:", error);
      toast.error("Failed to process Buy Now");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="product-card card-hover group"
    >
      <Link href={`/products/${product.slug}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 && product.id ? (
            <Image
              src={`/api/images/${product.id}/0`}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOnSale && (
              <span className="badge bg-primary text-white">
                -{discount}%
              </span>
            )}
            {product.isTopProduct && (
              <span className="badge bg-yellow-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Top
              </span>
            )}
            {product.stock < 1 && (
              <span className="badge bg-gray-800 text-white">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="product-card-content">
          {/* Title */}
          <h3 className="product-card-title">{product.name}</h3>

          {/* Description */}
          <p className="product-card-description">
            {truncateText(
              (product.shortDescription && typeof product.shortDescription === 'string' && product.shortDescription.trim() ? product.shortDescription.trim() : "") ||
              (product.description && typeof product.description === 'string' && product.description.trim() ? product.description.trim() : "") ||
              "",
              60
            )}
          </p>

          {/* Rating */}
          {/* {product.numReviews && product.numReviews > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">
                {product.averageRating?.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                ({product.numReviews})
              </span>
            </div>
          )} */}

          {/* Price */}
          <div className="product-card-price">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.discountedPrice || product.price)}
            </span>
            {isOnSale && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <button
          onClick={handleAddToCart}
          disabled={product.stock < 1}
          className="btn btn-secondary py-2 text-xs disabled:opacity-50"
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock < 1}
          className="btn btn-primary py-2 text-xs disabled:opacity-50"
        >
          <Zap className="w-4 h-4 mr-1" />
          Buy Now
        </button>
      </div>
    </motion.div>
  );
}

