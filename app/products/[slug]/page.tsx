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
  clearCurrentProduct,
} from "@/redux/slices/productSlice";
import { addToCart, openCart } from "@/redux/slices/cartSlice";
import { ProductCard } from "@/components/ui/ProductCard";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { KEYCHAIN_COLORS } from "@/lib/constants";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const product = useAppSelector(selectCurrentProduct);
  const relatedProducts = useAppSelector(selectRelatedProducts);
  const isLoading = useAppSelector(selectProductsLoading);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState<string | null>(null);
  const [selectedBorderColor, setSelectedBorderColor] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProduct(slug as string));
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].name);
    }
  }, [product]);

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
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: currentPrice.price,
        discountedPrice: currentPrice.discountedPrice,
        image: (product.images && product.images.length > 0 && product._id) ? `/api/images/${product._id}/0` : "",
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
    handleAddToCart();
    router.push("/checkout");
  };

  if (isLoading) {
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
        </div>
      </div>
    );
  }

  if (!product) {
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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-secondary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </button>

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
              {product.images && product.images.length > selectedImage && product._id ? (
                <Image
                  src={`/api/images/${product._id}/${selectedImage}`}
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
                    {product._id ? (
                      <Image
                        src={`/api/images/${product._id}/${index}`}
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

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>


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

