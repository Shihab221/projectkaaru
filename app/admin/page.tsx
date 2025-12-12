"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAdmin, selectIsAuthenticated, selectAuthInitialized } from "@/redux/slices/authSlice";

const stats = [
  {
    title: "Total Products",
    value: "124",
    change: "+12%",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    title: "Total Orders",
    value: "456",
    change: "+8%",
    icon: ShoppingCart,
    color: "bg-green-500",
  },
  {
    title: "Total Customers",
    value: "1,234",
    change: "+15%",
    icon: Users,
    color: "bg-purple-500",
  },
  {
    title: "Revenue",
    value: "৳125,000",
    change: "+23%",
    icon: DollarSign,
    color: "bg-primary",
  },
];

const quickActions = [
  {
    title: "Add Product",
    description: "Create a new product listing",
    href: "/admin/products/new",
    icon: Plus,
  },
  {
    title: "View Orders",
    description: "Manage customer orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Manage Categories",
    description: "Edit product categories",
    href: "/admin/categories",
    icon: Package,
  },
  {
    title: "Analytics",
    description: "View sales analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authInitialized = useAppSelector(selectAuthInitialized);

  useEffect(() => {
    // Only redirect after auth has been fully initialized
    if (authInitialized && (!isAuthenticated || !isAdmin)) {
      router.replace("/auth?redirect=/admin");
    }
  }, [authInitialized, isAuthenticated, isAdmin, router]);

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
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-secondary">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-secondary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="card card-hover p-6 block group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <action.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-secondary mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                  <ArrowRight className="w-4 h-4 text-primary mt-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-primary text-sm font-medium hover:underline"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No orders yet</p>
              <p className="text-sm mt-1">Orders will appear here when customers make purchases</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

