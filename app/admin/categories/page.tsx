"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  FolderPlus,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAdmin, selectIsAuthenticated, selectAuthInitialized } from "@/redux/slices/authSlice";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategories() {
  const router = useRouter();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authInitialized = useAppSelector(selectAuthInitialized);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<Category | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    subcategories: [] as string[],
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    subcategory: "",
  });

  useEffect(() => {
    if (authInitialized && (!isAuthenticated || !isAdmin)) {
      router.replace("/auth?redirect=/admin/categories");
    }
  }, [authInitialized, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (authInitialized && isAuthenticated && isAdmin) {
      fetchCategories();
    }
  }, [authInitialized, isAuthenticated, isAdmin]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Category created successfully");
        setShowAddModal(false);
        setFormData({ name: "", description: "", image: "", subcategories: [] });
        fetchCategories();
      } else {
        toast.error(data.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Category updated successfully");
        setShowEditModal(false);
        setEditingCategory(null);
        setFormData({ name: "", description: "", image: "", subcategories: [] });
        fetchCategories();
      } else {
        toast.error(data.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleToggleActive = async (categoryId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Category ${!currentStatus ? "activated" : "deactivated"} successfully`);
        fetchCategories();
      } else {
        toast.error(data.message || "Failed to update category status");
      }
    } catch (error) {
      console.error("Failed to update category status:", error);
      toast.error("Failed to update category status");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryForSub) return;

    try {
      const updatedSubcategories = [...selectedCategoryForSub.subcategories, subcategoryForm.subcategory];

      const res = await fetch(`/api/admin/categories/${selectedCategoryForSub.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...selectedCategoryForSub,
          subcategories: updatedSubcategories,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Subcategory added successfully");
        setShowSubcategoryModal(false);
        setSelectedCategoryForSub(null);
        setSubcategoryForm({ subcategory: "" });
        fetchCategories();
      } else {
        toast.error(data.message || "Failed to add subcategory");
      }
    } catch (error) {
      console.error("Failed to add subcategory:", error);
      toast.error("Failed to add subcategory");
    }
  };

  const handleRemoveSubcategory = async (categoryId: string, subcategoryToRemove: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const updatedSubcategories = category.subcategories.filter(sub => sub !== subcategoryToRemove);

    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...category,
          subcategories: updatedSubcategories,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Subcategory removed successfully");
        fetchCategories();
      } else {
        toast.error(data.message || "Failed to remove subcategory");
      }
    } catch (error) {
      console.error("Failed to remove subcategory:", error);
      toast.error("Failed to remove subcategory");
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      subcategories: category.subcategories,
    });
    setShowEditModal(true);
  };

  const openSubcategoryModal = (category: Category) => {
    setSelectedCategoryForSub(category);
    setShowSubcategoryModal(true);
  };

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary">
                Manage Categories
              </h1>
              <p className="text-gray-500 mt-1">
                Create and manage product categories and subcategories
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="w-12 h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <button
                    onClick={() => handleToggleActive(category.id, category.isActive)}
                    className={`p-1 rounded-lg transition-colors ${
                      category.isActive
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {category.isActive ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <h3 className="font-semibold text-secondary mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500 mb-2">/{category.slug}</p>

                {category.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* Subcategories */}
                {category.subcategories.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-secondary mb-2">Subcategories:</p>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.map((sub, subIndex) => (
                        <span
                          key={subIndex}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {sub}
                          <button
                            onClick={() => handleRemoveSubcategory(category.id, sub)}
                            className="hover:text-red-500 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex-1 btn btn-secondary text-sm py-2"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => openSubcategoryModal(category)}
                    className="flex-1 btn btn-outline text-sm py-2"
                  >
                    <FolderPlus className="w-4 h-4 mr-1" />
                    Add Sub
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-secondary mb-2">No categories yet</h3>
            <p className="text-gray-500 mb-6">Create your first category to organize your products</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </button>
          </div>
        )}

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-secondary mb-4">Add New Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Electronics, Clothing"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Optional description for the category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-secondary mb-4">Edit Category</h2>
              <form onSubmit={handleEditCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Electronics, Clothing"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Optional description for the category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCategory(null);
                      setFormData({ name: "", description: "", image: "", subcategories: [] });
                    }}
                    className="flex-1 btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Update Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Subcategory Modal */}
        {showSubcategoryModal && selectedCategoryForSub && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-secondary mb-2">
                Add Subcategory to {selectedCategoryForSub.name}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Add a subcategory to organize products within this category
              </p>

              <form onSubmit={handleAddSubcategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    value={subcategoryForm.subcategory}
                    onChange={(e) => setSubcategoryForm({ subcategory: e.target.value })}
                    className="input"
                    placeholder="e.g., Smartphones, Laptops"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubcategoryModal(false);
                      setSelectedCategoryForSub(null);
                      setSubcategoryForm({ subcategory: "" });
                    }}
                    className="flex-1 btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Add Subcategory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
