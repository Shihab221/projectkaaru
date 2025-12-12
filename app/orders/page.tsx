"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import {
  selectIsAuthenticated,
  selectAuthInitialized,
} from "@/redux/slices/authSlice";
import toast from "react-hot-toast";
import Link from "next/link";

interface Order {
  _id: string;
  orderNumber: string;
  items: {
    name: string;
    image: string;
    price: number;
    quantity: number;
    color?: string;
    font?: string;
  }[];
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusMessages = {
  pending: "Order placed, waiting for confirmation",
  confirmed: "Order confirmed, preparing for shipment",
  processing: "Order is being processed",
  shipped: "Order is on the way",
  delivered: "Order delivered successfully",
  cancelled: "Order was cancelled",
};

export default function OrdersPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authInitialized = useAppSelector(selectAuthInitialized);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      router.replace("/auth?redirect=/orders");
    }
  }, [authInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (authInitialized && isAuthenticated) {
      fetchOrders();
    }
  }, [authInitialized, isAuthenticated]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/orders");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setOrders(data.orders || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
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
              My Orders
            </h1>
            <p className="text-gray-500 mt-1">
              Track and manage your orders
            </p>
          </motion.div>

          {/* Orders List */}
          {isLoading ? (
            <div className="card p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-12 text-center"
            >
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-secondary mb-2">
                No orders yet
              </h2>
              <p className="text-gray-500 mb-6">
                You haven&apos;t placed any orders yet. Start shopping to see your orders here!
              </p>
              <Link href="/products" className="btn btn-primary">
                Browse Products
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const StatusIcon = statusIcons[order.status];
                const isExpanded = expandedOrder === order._id;

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card overflow-hidden"
                  >
                    {/* Order Header */}
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm font-medium text-secondary">
                              {order.orderNumber}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                statusColors[order.status]
                              }`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-secondary">
                              ৳{order.total.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.items.length} item{order.items.length > 1 ? "s" : ""}
                            </p>
                          </div>
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100"
                      >
                        {/* Status Message */}
                        <div className="px-6 py-4 bg-gray-50">
                          <p className="text-sm text-gray-600">
                            <StatusIcon className="w-4 h-4 inline mr-2" />
                            {statusMessages[order.status]}
                          </p>
                        </div>

                        {/* Items */}
                        <div className="p-6 space-y-4">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-4"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-secondary">
                                  {item.name}
                                </p>
                                {item.color && (
                                  <p className="text-sm text-gray-500">
                                    Color: {item.color}
                                  </p>
                                )}
                                {item.font && (
                                  <p className="text-sm text-gray-500">
                                    Font: {item.font}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold text-secondary">
                                ৳{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



