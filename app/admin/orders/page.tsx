"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import {
  selectIsAdmin,
  selectIsAuthenticated,
  selectAuthInitialized,
} from "@/redux/slices/authSlice";
import toast from "react-hot-toast";
import Link from "next/link";
import { KEYCHAIN_COLORS } from "@/lib/constants";

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: {
    name: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
    backgroundColor?: string;
    borderColor?: string;
  }[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  itemsTotal: number;
  shippingCost: number;
  discount: number;
  paymentProcessingFee: number;
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

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authInitialized = useAppSelector(selectAuthInitialized);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (authInitialized && (!isAuthenticated || !isAdmin)) {
      router.replace("/auth?redirect=/admin");
    }
  }, [authInitialized, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (authInitialized && isAuthenticated && isAdmin) {
      fetchOrders();
    }
  }, [authInitialized, isAuthenticated, isAdmin]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setOrders(data.orders || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus as Order["status"] } : order
        )
      );
      toast.success("Order status updated");
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          <Link
            href="/admin"
            className="flex items-center gap-2 text-gray-500 hover:text-secondary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary">
                Orders
              </h1>
              <p className="text-gray-500 mt-1">
                Manage and track customer orders
              </p>
            </div>
            <button
              onClick={fetchOrders}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number or customer name..."
                className="input pl-10 w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-10 pr-8 appearance-none min-w-[180px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
              {orders.length === 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  Orders will appear here when customers make purchases
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                      Order
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                      Customer
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                      Items
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                      Total
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                      Payment
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => {
                    const StatusIcon = statusIcons[order.status];
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm font-medium text-secondary">
                            {order.orderNumber}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-secondary text-sm">
                              {order.shippingAddress.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.shippingAddress.phone}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600">
                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-secondary">
                            ৳{order.total.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              paymentStatusColors[order.paymentStatus]
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[order.status]
                            }`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-secondary">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Customer Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-secondary">
                      {selectedOrder.shippingAddress.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.shippingAddress.phone}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedOrder.shippingAddress.street}
                      <br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.postalCode}
                      <br />
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 bg-gray-50 rounded-lg p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-secondary">{item.name}</p>
                          {item.size && (
                            <p className="text-sm text-gray-500">Size: {item.size}</p>
                          )}
                          {(item.backgroundColor || item.borderColor) && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-xs font-semibold text-yellow-800 mb-1">🎨 Customer's Keychain Colors:</p>
                              <div className="flex items-center gap-3">
                                {item.backgroundColor && (
                                  <div className="flex items-center gap-1">
                                    <span
                                      className="inline-block w-4 h-4 rounded-full border border-gray-400"
                                      style={{ backgroundColor: item.backgroundColor }}
                                    />
                                    <span className="text-sm text-gray-700">BG: {KEYCHAIN_COLORS.find(c => c.hex === item.backgroundColor)?.name || item.backgroundColor}</span>
                                  </div>
                                )}
                                {item.borderColor && (
                                  <div className="flex items-center gap-1">
                                    <span
                                      className="inline-block w-4 h-4 rounded-full border border-gray-400"
                                      style={{ backgroundColor: item.borderColor }}
                                    />
                                    <span className="text-sm text-gray-700">Border: {KEYCHAIN_COLORS.find(c => c.hex === item.borderColor)?.name || item.borderColor}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-secondary">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Order Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span>৳{selectedOrder.itemsTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span>৳{selectedOrder.shippingCost.toLocaleString()}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-৳{selectedOrder.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrder.paymentProcessingFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Processing Fee</span>
                        <span>৳{selectedOrder.paymentProcessingFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-secondary pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>৳{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Update Status */}
                <div>
                  <h3 className="font-semibold text-secondary mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(selectedOrder._id, status)}
                          disabled={isUpdating || selectedOrder.status === status}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedOrder.status === status
                              ? statusColors[status as keyof typeof statusColors] + " ring-2 ring-offset-2 ring-current"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}









