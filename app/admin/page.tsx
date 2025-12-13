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
  Clock,
  CheckCircle,
  Truck,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAdmin, selectIsAuthenticated, selectAuthInitialized } from "@/redux/slices/authSlice";
import { formatPrice } from "@/lib/utils";

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

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [stats, setStats] = useState([
    {
      title: "Total Products",
      value: "0",
      change: "0%",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: "0",
      change: "0%",
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Total Customers",
      value: "0",
      change: "0%",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Revenue",
      value: "৳0",
      change: "0%",
      icon: DollarSign,
      color: "bg-primary",
    },
  ]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    // Only redirect after auth has been fully initialized
    if (authInitialized && (!isAuthenticated || !isAdmin)) {
      router.replace("/auth?redirect=/admin");
    }
  }, [authInitialized, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (authInitialized && isAuthenticated && isAdmin) {
      fetchRecentOrders();
      fetchStats();
    }
  }, [authInitialized, isAuthenticated, isAdmin]);

  const fetchRecentOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/orders?limit=5");
      const data = await res.json();
      if (res.ok) {
        setRecentOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch recent orders:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) {
        setStats([
          {
            title: "Total Products",
            value: data.totalProducts?.toString() || "0",
            change: data.productsChange || "0%",
            icon: Package,
            color: "bg-blue-500",
          },
          {
            title: "Total Orders",
            value: data.totalOrders?.toString() || "0",
            change: data.ordersChange || "0%",
            icon: ShoppingCart,
            color: "bg-green-500",
          },
          {
            title: "Total Customers",
            value: data.totalCustomers?.toString() || "0",
            change: data.customersChange || "0%",
            icon: Users,
            color: "bg-purple-500",
          },
          {
            title: "Revenue",
            value: `৳${data.totalRevenue?.toLocaleString() || "0"}`,
            change: data.revenueChange || "0%",
            icon: DollarSign,
            color: "bg-primary",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "confirmed":
      case "processing":
        return CheckCircle;
      case "shipped":
        return Truck;
      case "delivered":
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "processing":
        return "text-indigo-600 bg-indigo-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
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
                  {isLoadingStats ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <stat.icon className="w-6 h-6 text-white" />
                  )}
                </div>
                {!isLoadingStats && (
                  <span className="text-sm font-medium text-green-500 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
              {isLoadingStats ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-secondary">{stat.value}</p>
              )}
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
            {isLoadingOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order, index) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(order.status)}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-secondary text-sm">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.shippingAddress?.name} • {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary">
                          ৳{order.total?.toLocaleString()}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No orders yet</p>
                <p className="text-sm mt-1">Orders will appear here when customers make purchases</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

