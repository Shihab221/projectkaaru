"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  Package,
  Settings,
  Shield,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthInitialized,
  selectIsAdmin,
  setUser,
} from "@/redux/slices/authSlice";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isAdmin = useAppSelector(selectIsAdmin);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Bangladesh",
    },
  });

  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      router.replace("/auth?redirect=/profile");
    }
  }, [authInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          postalCode: user.address?.postalCode || "",
          country: user.address?.country || "Bangladesh",
        },
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      dispatch(setUser(data.user));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!authInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-secondary">
              My Profile
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your account settings and preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="card p-6">
                {/* User Avatar */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-secondary">
                    {user?.name}
                  </h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>

                {/* Quick Links */}
                <div className="space-y-2">
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    <Package className="w-5 h-5" />
                    <span>My Orders</span>
                  </Link>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 w-full text-left"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-colors text-primary"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit}>
                <div className="card p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-secondary">
                      Personal Information
                    </h2>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-gray-500 text-sm font-medium hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="input pl-12"
                          placeholder="Your full name"
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={user?.email || ""}
                          className="input pl-12 bg-gray-50"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="input pl-12"
                          placeholder="+880 1XXX-XXXXXX"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Delivery Address
                    </h3>

                    <div className="space-y-4">
                      {/* Street */}
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, street: e.target.value },
                            })
                          }
                          className="input"
                          placeholder="House no, Road, Area"
                          disabled={!isEditing}
                        />
                      </div>

                      {/* City & State */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-1.5">
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.address.city}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: { ...formData.address, city: e.target.value },
                              })
                            }
                            className="input"
                            placeholder="Dhaka"
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-1.5">
                            State/Division
                          </label>
                          <input
                            type="text"
                            value={formData.address.state}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: { ...formData.address, state: e.target.value },
                              })
                            }
                            className="input"
                            placeholder="Dhaka Division"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      {/* Postal Code & Country */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-1.5">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={formData.address.postalCode}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: { ...formData.address, postalCode: e.target.value },
                              })
                            }
                            className="input"
                            placeholder="1200"
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-1.5">
                            Country
                          </label>
                          <input
                            type="text"
                            value={formData.address.country}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: { ...formData.address, country: e.target.value },
                              })
                            }
                            className="input"
                            placeholder="Bangladesh"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="btn btn-primary"
                      >
                        {isSaving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
















