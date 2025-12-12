"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAdmin, selectAuthInitialized, selectIsAuthenticated } from "@/redux/slices/authSlice";
import toast from "react-hot-toast";
import { KEYCHAIN_COLORS } from "@/lib/constants";

interface Category {
  _id: string;
  name: string;
  slug: string;
  subcategories: string[];
}

export default function NewProductPage() {
  const router = useRouter();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authInitialized = useAppSelector(selectAuthInitialized);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    discountedPrice: "",
    category: "",
    subcategory: "",
    stock: "",
    isTopProduct: false,
    colors: [] as string[],
    images: [] as string[],
  });

  useEffect(() => {
    if (authInitialized && (!isAuthenticated || !isAdmin)) {
      router.replace("/auth?redirect=/admin");
    }
  }, [authInitialized, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          discountedPrice: formData.discountedPrice
            ? parseFloat(formData.discountedPrice)
            : undefined,
          stock: parseInt(formData.stock),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const selectedCategory = categories.find((c) => c._id === formData.category);
  const isKeychain = selectedCategory?.slug === "key-chains";

  if (!authInitialized || !isAuthenticated || !isAdmin) {
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
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-secondary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            Add New Product
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl">
          <div className="card p-6 md:p-8 space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-secondary mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                    className="input"
                    placeholder="Brief description for product cards"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Full Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input min-h-[120px]"
                    placeholder="Detailed product description"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-lg font-semibold text-secondary mb-4">
                Pricing & Stock
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Price (৳) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="input"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Discounted Price (৳)
                  </label>
                  <input
                    type="number"
                    value={formData.discountedPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, discountedPrice: e.target.value })
                    }
                    className="input"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="input"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <h2 className="text-lg font-semibold text-secondary mb-4">
                Category
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        subcategory: "",
                      })
                    }
                    className="input"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCategory && selectedCategory.subcategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Subcategory
                    </label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) =>
                        setFormData({ ...formData, subcategory: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">Select subcategory</option>
                      {selectedCategory.subcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Colors (for keychains) */}
            {isKeychain && (
              <div>
                <h2 className="text-lg font-semibold text-secondary mb-4">
                  Available Colors
                </h2>
                <div className="flex flex-wrap gap-2">
                  {KEYCHAIN_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColor(color.name)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.colors.includes(color.name)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Top Product */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isTopProduct"
                checked={formData.isTopProduct}
                onChange={(e) =>
                  setFormData({ ...formData, isTopProduct: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isTopProduct" className="text-sm text-secondary">
                Mark as Top Product (will be featured on homepage)
              </label>
            </div>

            {/* Image URLs */}
            <div>
              <h2 className="text-lg font-semibold text-secondary mb-4">
                Product Images
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Enter image URLs (one per line). You can use Cloudinary, Imgur, or any image hosting service.
              </p>
              <textarea
                value={formData.images.join("\n")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    images: e.target.value.split("\n").filter((url) => url.trim()),
                  })
                }
                className="input min-h-[100px]"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Product
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

