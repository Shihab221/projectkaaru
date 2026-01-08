"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Eye,
  DollarSign,
  Tag,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Power,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAdmin, selectIsAuthenticated, selectAuthInitialized } from "@/redux/slices/authSlice";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: string;
  images: Array<{
    data: Buffer;
    contentType: string;
    filename: string;
    id: string;
  }>;
  stock: number;
  sizes?: Array<{
    name: string;
    price: number;
    discountedPrice?: number;
    stock: number;
    id: string;
  }>;
  backgroundColors?: string[];
  borderColors?: string[];
  isActive: boolean;
  isTopProduct: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProducts() {
  const router = useRouter();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authInitialized = useAppSelector(selectAuthInitialized);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (authInitialized && (!isAuthenticated || !isAdmin)) {
      router.replace("/auth?redirect=/admin/products");
    }
  }, [authInitialized, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (authInitialized && isAuthenticated && isAdmin) {
      fetchProducts();
    }
  }, [authInitialized, isAuthenticated, isAdmin]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      } else {
        toast.error(data.error || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Product deleted successfully");
        setProducts(products.filter(p => p.id !== deletingProduct.id));
        setShowDeleteModal(false);
        setDeletingProduct(null);
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    setTogglingProductId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !product.isActive,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'} successfully`);
        setProducts(products.map(p =>
          p.id === product.id
            ? { ...p, isActive: !p.isActive }
            : p
        ));
      } else {
        toast.error(data.message || "Failed to update product status");
      }
    } catch (error) {
      console.error("Failed to toggle product status:", error);
      toast.error("Failed to update product status");
    } finally {
      setTogglingProductId(null);
    }
  };

  const confirmDelete = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  // Show loading until auth is initialized
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading if not admin (redirect will happen via useEffect)
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary">
                Manage Products
              </h1>
              <p className="text-gray-500 mt-1">
                View and manage all your products
              </p>
            </div>
          </div>
          <Link
            href="/admin/products/new"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-secondary">
                  {isLoading ? "..." : products.length}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Products</p>
                <p className="text-2xl font-bold text-secondary">
                  {isLoading ? "..." : products.filter(p => p.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Top Products</p>
                <p className="text-2xl font-bold text-secondary">
                  {isLoading ? "..." : products.filter(p => p.isTopProduct).length}
                </p>
              </div>
              <Tag className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-secondary">
                  {isLoading ? "..." : formatPrice(products.reduce((sum, p) => sum + p.price, 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
        </div>

        {/* Products List */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-secondary">All Products</h2>
          </div>

          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={`/api/images/${product.id}/0`}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                      {/* Fallback icon (hidden by default) */}
                      <Package className="w-8 h-8 text-gray-400 hidden" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-secondary truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {product.category?.name} • {product.stock} in stock
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {product.shortDescription || product.description}
                          </p>

                          {/* Sizes */}
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.sizes.slice(0, 3).map((size, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                >
                                  {size.name}: {formatPrice(size.price)}
                                </span>
                              ))}
                              {product.sizes.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{product.sizes.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Colors */}
                          {(product.backgroundColors?.length > 0 || product.borderColors?.length > 0) && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">Colors:</span>
                              {product.backgroundColors?.slice(0, 3).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{ backgroundColor: color }}
                                  title={`Background: ${color}`}
                                />
                              ))}
                              {product.borderColors?.slice(0, 3).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-4 h-4 rounded border-2"
                                  style={{ borderColor: color }}
                                  title={`Border: ${color}`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Status Badges */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                            {product.isTopProduct && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Top Product
                              </span>
                            )}
                            {product.discountedPrice && product.discountedPrice < product.price && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                On Sale
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex items-center gap-4 ml-4">
                          <div className="text-right">
                            <p className="font-semibold text-secondary">
                              {formatPrice(product.price)}
                            </p>
                            {product.discountedPrice && product.discountedPrice < product.price && (
                              <p className="text-sm text-gray-500 line-through">
                                {formatPrice(product.discountedPrice)}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="View Product"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleToggleActive(product)}
                              disabled={togglingProductId === product.id}
                              className={`p-2 rounded-lg transition-colors ${
                                product.isActive
                                  ? "text-green-500 hover:text-green-600 hover:bg-green-50"
                                  : "text-gray-400 hover:text-green-500 hover:bg-green-50"
                              }`}
                              title={product.isActive ? "Deactivate Product" : "Activate Product"}
                            >
                              {togglingProductId === product.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </button>

                            <Link
                              href={`/admin/products/new?id=${product.id}`}
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => confirmDelete(product)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first product.
              </p>
              <Link href="/admin/products/new" className="btn-primary">
                Add Your First Product
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary">
                Delete Product
              </h3>
            </div>

            <div className="text-gray-600 mb-6">
              <p className="mb-3">
                Are you sure you want to delete <strong>"{deletingProduct.name}"</strong>?
              </p>
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                If this product has been ordered, consider deactivating it instead of deleting it to preserve order history.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              {deletingProduct && deletingProduct.isActive && (
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    handleToggleActive(deletingProduct);
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  disabled={isDeleting}
                >
                  Deactivate Instead
                </button>
              )}
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
