"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Zap,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  ArrowLeft,
  Heart,
  Share2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchProduct,
  selectCurrentProduct,
  selectRelatedProducts,
  selectProductsLoading,
  selectProductsError,
  clearCurrentProduct,
} from "@/redux/slices/productSlice";
import { addToCart, openCart, clearCart } from "@/redux/slices/cartSlice";
import { ProductCard } from "@/components/ui/ProductCard";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { KEYCHAIN_COLORS } from "@/lib/constants";
import toast from "react-hot-toast";
import { trackViewContent } from "@/lib/analytics";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const product = useAppSelector(selectCurrentProduct);
  const relatedProducts = useAppSelector(selectRelatedProducts);
  const isLoading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState<string | null>(null);
  const [selectedBorderColor, setSelectedBorderColor] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);

  const handleManualRetry = () => {
    if (slug) {
      setRetryCount(0);
      setHasShownError(false);
      dispatch(fetchProduct(slug as string));
    }
  };

  useEffect(() => {
    if (slug) {
      dispatch(fetchProduct(slug as string));
      setRetryCount(0);
      setHasShownError(false);
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, slug]);

  // Retry logic for failed requests
  useEffect(() => {
    if (error && !isLoading && !hasShownError && retryCount < 3) {
      setIsRetrying(true);
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s

      const timer = setTimeout(() => {
        if (slug) {
          setRetryCount(prev => prev + 1);
          dispatch(fetchProduct(slug as string));
        }
      }, retryDelay);

      return () => clearTimeout(timer);
    } else if (error && !isLoading && retryCount >= 3) {
      setHasShownError(true);
      setIsRetrying(false);
    } else if (!error) {
      setIsRetrying(false);
    }
  }, [error, isLoading, retryCount, slug, dispatch, hasShownError]);

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].name);
    }
  }, [product]);

  // Track ViewContent when product is loaded
  useEffect(() => {
    if (product) {
      const price = currentPrice.discountedPrice || currentPrice.price;
      trackViewContent(
        product.id,
        product.name,
        product.category?.name,
        price,
        "BDT"
      );
    }
  }, [product?.id]); // Track once per product

  // Get current price based on selected size or default
  const getCurrentPrice = () => {
    if (selectedSize && product?.sizes) {
      const sizeData = product.sizes.find(s => s.name === selectedSize);
      if (sizeData) {
        return {
          price: sizeData.price,
          discountedPrice: sizeData.discountedPrice,
        };
      }
    }
    return {
      price: product?.price || 0,
      discountedPrice: product?.discountedPrice,
    };
  };

  const currentPrice = getCurrentPrice();
  const isOnSale = currentPrice.discountedPrice && currentPrice.discountedPrice < currentPrice.price;
  const discount = isOnSale
    ? calculateDiscount(currentPrice.price, currentPrice.discountedPrice!)
    : 0;

  // Get stock for selected size
  const getCurrentStock = () => {
    if (selectedSize && product?.sizes) {
      const sizeData = product.sizes.find(s => s.name === selectedSize);
      if (sizeData) {
        return sizeData.stock || 1000;
      }
    }
    return product?.stock || 1000;
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (getCurrentStock() < 1) {
      toast.error("Product is out of stock");
      return;
    }

    // Check if size is required but not selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Check if keychain colors are required but not selected
    if (product.category?.slug === 'key-chains') {
      if (product.backgroundColors && product.backgroundColors.length > 0 && !selectedBackgroundColor) {
        toast.error("Please select a background color for your keychain");
        return;
      }
      if (product.borderColors && product.borderColors.length > 0 && !selectedBorderColor) {
        toast.error("Please select a border color for your keychain");
        return;
      }
    }

    dispatch(
      addToCart({
        _id: product.id,
        name: product.name,
        slug: product.slug,
        price: currentPrice.price,
        discountedPrice: currentPrice.discountedPrice,
        image: (product.images && product.images.length > 0 && product.id) ? `/api/images/${product.id}/0` : "",
        quantity,
        stock: getCurrentStock(),
        size: selectedSize || undefined,
        selectedBackgroundColor: selectedBackgroundColor || undefined,
        selectedBorderColor: selectedBorderColor || undefined,
      })
    );
    dispatch(openCart());
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    // Clear cart first, then add this product
    dispatch(clearCart());

    // Add product to cart with all selected options
    dispatch(
      addToCart({
        _id: product.id,
        name: product.name,
        slug: product.slug,
        price: currentPrice.price,
        discountedPrice: currentPrice.discountedPrice,
        image: (product.images && product.images.length > 0 && product.id) ? `/api/images/${product.id}/0` : "",
        quantity,
        stock: getCurrentStock(),
        size: selectedSize || undefined,
        selectedBackgroundColor: selectedBackgroundColor || undefined,
        selectedBorderColor: selectedBorderColor || undefined,
      })
    );

    // Open cart sidebar
    dispatch(openCart());
    toast.success("Added to cart!");
  };

  if (isLoading || isRetrying) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          {isRetrying && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Retrying... ({retryCount}/3)
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show error state if we've exhausted retries or it's a definitive error
  if (hasShownError || (error && !isLoading && !product)) {
    const isNotFoundError = error?.includes("not found") || error?.includes("404");
    const isNetworkError = error?.includes("Network error") || error?.includes("Failed to fetch");

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary mb-2">
            {isNotFoundError ? "Product Not Found" : "Unable to Load Product"}
          </h1>
          <p className="text-gray-600 mb-6">
            {isNotFoundError
              ? "The product you're looking for doesn't exist or has been removed."
              : isNetworkError
              ? "There was a network issue. Please check your connection and try again."
              : "We encountered an error while loading this product. Please try again later."
            }
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                if (slug) {
                  setRetryCount(0);
                  setHasShownError(false);
                  dispatch(fetchProduct(slug as string));
                }
              }}
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Try Again"}
            </button>
            <Link href="/products" className="btn btn-secondary">
              Browse Products
            </Link>
          </div>
          {retryCount > 0 && !isNotFoundError && (
            <p className="text-xs text-gray-500 mt-4">
              Retried {retryCount} time{retryCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    );
  }

  // If we get here without a product but no error, it means the product truly doesn't exist
  if (!product && !isLoading && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary mb-4">
            Product not found
          </h1>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-6 md:py-8">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to products
          </button>

          {/* Manual retry button - only show if there was an error */}
          {hasShownError && (
            <button
              onClick={handleManualRetry}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          )}
        </div>

        {/* Product Section */}
        <div
          className="grid md:grid-cols-2 gap-8 md:gap-12 rounded-2xl p-6 md:p-8 bg-white border-2 border-gray-200"
        >
          {/* Images */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative"
            >
              {product.images && product.images.length > selectedImage && product.id ? (
                <Image
                  src={`/api/images/${product.id}/${selectedImage}`}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingCart className="w-16 h-16" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isOnSale && (
                  <span className="badge bg-primary text-white px-3 py-1">
                    -{discount}% OFF
                  </span>
                )}
                {product.isTopProduct && (
                  <span className="badge bg-yellow-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Top Product
                  </span>
                )}
              </div>
            </motion.div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    {product.id ? (
                      <Image
                        src={`/api/images/${product.id}/${index}`}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
              {product.name}
            </h1>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({product.numReviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(currentPrice.discountedPrice || currentPrice.price)}
              </span>
              {isOnSale && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(currentPrice.price)}
                  </span>
                  <span className="badge badge-success">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Short Description (after title) */}
            {product.shortDescription && (
              <p className="text-gray-600 mb-4 leading-relaxed">
                {product.shortDescription}
              </p>
            )}


            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-3">
                  Select Size: <span className="text-primary">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedSize === size.name
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {size.name} - ৳{size.discountedPrice || size.price}
                      {size.discountedPrice && size.discountedPrice < size.price && (
                        <span className="ml-2 text-xs line-through text-gray-400">
                          ৳{size.price}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection (for keychains only - customer chooses their keychain colors) */}
            {product.category?.slug === 'key-chains' && 
             ((product.backgroundColors && product.backgroundColors.length > 0) || 
              (product.borderColors && product.borderColors.length > 0)) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-secondary mb-3">🎨 Choose Your Keychain Colors</h3>
                <p className="text-xs text-gray-500 mb-4">Select the colors you want for your custom keychain</p>

                {/* Background Color Selection */}
                {product.backgroundColors && product.backgroundColors.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Keychain Background Color: <span className="text-primary font-semibold">{selectedBackgroundColor ? KEYCHAIN_COLORS.find(c => c.hex === selectedBackgroundColor)?.name : 'Please select'}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.backgroundColors.map((colorHex) => {
                        const color = KEYCHAIN_COLORS.find(c => c.hex === colorHex);
                        if (!color) return null;
                        return (
                          <button
                            key={`bg-${colorHex}`}
                            onClick={() => setSelectedBackgroundColor(colorHex)}
                            className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              selectedBackgroundColor === colorHex
                                ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                                : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <span
                              className="inline-block w-5 h-5 rounded-full mr-2 border-2 border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Border Color Selection */}
                {product.borderColors && product.borderColors.length > 0 && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Keychain Border Color: <span className="text-primary font-semibold">{selectedBorderColor ? KEYCHAIN_COLORS.find(c => c.hex === selectedBorderColor)?.name : 'Please select'}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.borderColors.map((colorHex) => {
                        const color = KEYCHAIN_COLORS.find(c => c.hex === colorHex);
                        if (!color) return null;
                        return (
                          <button
                            key={`border-${colorHex}`}
                            onClick={() => setSelectedBorderColor(colorHex)}
                            className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              selectedBorderColor === colorHex
                                ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                                : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <span
                              className="inline-block w-5 h-5 rounded-full mr-2 border-2 border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Color Preview */}
                {(selectedBackgroundColor || selectedBorderColor) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Your selection preview:</p>
                    <div 
                      className="w-16 h-16 rounded-lg"
                      style={{ 
                        backgroundColor: selectedBackgroundColor || '#f3f4f6',
                        border: `3px solid ${selectedBorderColor || '#e5e7eb'}`
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(getCurrentStock(), quantity + 1))
                  }
                  className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500 ml-2">
                  {getCurrentStock() > 0
                    ? `${getCurrentStock()} in stock`
                    : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={getCurrentStock() < 1}
                className="btn btn-secondary flex-1 disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={getCurrentStock() < 1}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                <Zap className="w-5 h-5 mr-2" />
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-sm text-gray-600">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-gray-600">Quality Guaranteed</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full Description (under image/cart section) */}
        <div className="mt-8 bg-white rounded-2xl p-6 border-2 border-gray-200 max-w-none overflow-hidden">
          <h3 className="text-xl font-bold text-secondary mb-4">Product Details</h3>
          <div className="text-gray-600 leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">
            {product.description}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-secondary mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

