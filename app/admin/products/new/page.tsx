"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Loader2,
  ImagePlus,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAdmin, selectAuthInitialized, selectIsAuthenticated } from "@/redux/slices/authSlice";
import toast from "react-hot-toast";
import { KEYCHAIN_COLORS } from "@/lib/constants";
// Color selector component for keychains (multiple selection)
const ColorSelector = ({ selectedColors, onColorsChange, label, colors }: {
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
  label: string;
  colors: Array<{ name: string; hex: string }>
}) => {
  const toggleColor = (colorHex: string) => {
    if (selectedColors.includes(colorHex)) {
      // Remove color if already selected
      onColorsChange(selectedColors.filter(c => c !== colorHex));
    } else {
      // Add color if not selected
      onColorsChange([...selectedColors, colorHex]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-secondary mb-1.5">
        {label}: {selectedColors.length > 0 ? `${selectedColors.length} selected` : 'None selected'}
      </label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = selectedColors.includes(color.hex);
          return (
            <button
              key={color.name}
              type="button"
              onClick={() => toggleColor(color.hex)}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span
                className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-300"
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
              {isSelected && <span className="ml-1">✓</span>}
            </button>
          );
        })}
      </div>
      {selectedColors.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Selected: {selectedColors.map(hex => colors.find(c => c.hex === hex)?.name).join(', ')}
        </div>
      )}
    </div>
  );
};
import Image from "next/image";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Array<{ data: string; contentType: string; filename: string }>>([]);
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
    sizes: [] as Array<{ name: string; price: string; discountedPrice: string; stock: string }>,
    backgroundColors: [] as string[],
    borderColors: [] as string[],
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of newFiles) {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 5MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...validFiles]);
      
      // Generate previews
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    const formDataUpload = new FormData();
    imageFiles.forEach((file) => {
      formDataUpload.append("images", file);
    });

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formDataUpload,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to upload images");
    }

    setUploadedImages(data.images);
    return data.images;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload images first and get the result directly
      let uploadedImagesResult: any[] = [];
      if (imageFiles.length > 0) {
        setIsUploading(true);
        uploadedImagesResult = await uploadImages();
        setIsUploading(false);
      }

      // Prepare sizes data
      const sizesData = formData.sizes.length > 0 ? formData.sizes.map(size => ({
        name: size.name,
        price: parseFloat(size.price),
        discountedPrice: size.discountedPrice ? parseFloat(size.discountedPrice) : undefined,
        stock: size.stock ? parseInt(size.stock) : 1000,
      })) : undefined;

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          discountedPrice: formData.discountedPrice
            ? parseFloat(formData.discountedPrice)
            : undefined,
          stock: formData.stock ? parseInt(formData.stock) : undefined,
          sizes: sizesData,
          backgroundColors: formData.backgroundColors,
          borderColors: formData.borderColors,
          images: uploadedImagesResult,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      toast.success("Product created successfully!");
      router.push("/admin");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const addSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { name: "", price: "", discountedPrice: "", stock: "" }],
    }));
  };

  const updateSize = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((size, i) =>
        i === index ? { ...size, [field]: value } : size
      ),
    }));
  };

  const removeSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const selectedCategory = categories.find((c) => c._id === formData.category);
  const isKeychain = selectedCategory?.slug === "key-chains";
  const isNameplate = selectedCategory?.slug === "key-chains";

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
              <p className="text-sm text-gray-500 mb-4">
                {formData.sizes.length > 0
                  ? "Size-specific pricing will be used. These are fallback values."
                  : "Set base price and stock. You can also add multiple sizes below."
                }
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Base Price (৳) *
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
                    Base Discounted Price (৳)
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
                    Base Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="input"
                    placeholder="1000"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Defaults to 1000 if empty</p>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h2 className="text-lg font-semibold text-secondary mb-4">
                Product Sizes (Optional)
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Add different sizes with individual prices and stock levels. Leave empty to use base pricing.
              </p>

              {formData.sizes.map((size, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-secondary">Size {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Size Name *
                      </label>
                      <input
                        type="text"
                        value={size.name}
                        onChange={(e) => updateSize(index, "name", e.target.value)}
                        className="input"
                        placeholder="Small"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Price (৳) *
                      </label>
                      <input
                        type="number"
                        value={size.price}
                        onChange={(e) => updateSize(index, "price", e.target.value)}
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
                        value={size.discountedPrice}
                        onChange={(e) => updateSize(index, "discountedPrice", e.target.value)}
                        className="input"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={size.stock}
                        onChange={(e) => updateSize(index, "stock", e.target.value)}
                        className="input"
                        placeholder="1000"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Defaults to 1000</p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSize}
                className="btn btn-secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Size
              </button>
            </div>

            {/* Colors (for keychains only) */}
            {isKeychain && (
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 bg-primary/5">
                <h2 className="text-lg font-semibold text-secondary mb-2">
                  🎨 Keychain Color Options for Customers
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Select which colors customers can choose from when ordering this keychain. 
                  These colors will appear as options on the product page.
                </p>
                <div className="space-y-4">
                  <ColorSelector
                    label="Font Colors (customers will choose ONE)"
                    selectedColors={formData.backgroundColors}
                    onColorsChange={(colors) => setFormData({ ...formData, backgroundColors: colors })}
                    colors={KEYCHAIN_COLORS}
                  />
                  <ColorSelector
                    label="Border Colors (customers will choose ONE)"
                    selectedColors={formData.borderColors}
                    onColorsChange={(colors) => setFormData({ ...formData, borderColors: colors })}
                    colors={KEYCHAIN_COLORS}
                  />
                </div>
              </div>
            )}

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

            {/* Image Upload */}
            <div>
              <h2 className="text-lg font-semibold text-secondary mb-4">
                Product Images
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Upload product images (JPG, PNG, WebP, GIF - Max 5MB each)
              </p>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <ImagePlus className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm font-medium text-secondary">
                  Click to upload images
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or drag and drop
                </p>
              </button>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="btn btn-primary"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {isUploading ? "Uploading Images..." : "Creating..."}
                  </>
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
                disabled={isSubmitting || isUploading}
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

