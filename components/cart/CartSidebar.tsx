"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  selectCartItems,
  selectCartTotal,
  selectIsCartOpen,
  closeCart,
  removeFromCart,
  updateQuantity,
} from "@/redux/slices/cartSlice";
import { formatPrice } from "@/lib/utils";

export function CartSidebar() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsCartOpen);
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-secondary flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Your Cart ({items.length})
              </h2>
              <button
                onClick={() => dispatch(closeCart())}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Link
                    href="/products"
                    onClick={() => dispatch(closeCart())}
                    className="btn btn-primary"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item._id}-${item.color}`}
                      className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => dispatch(closeCart())}
                          className="font-medium text-secondary hover:text-primary line-clamp-1"
                        >
                          {item.name}
                        </Link>

                        {item.color && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Color: {item.color}
                          </p>
                        )}

                        <p className="text-primary font-semibold mt-1">
                          {formatPrice(item.discountedPrice || item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    _id: item._id,
                                    color: item.color,
                                    quantity: item.quantity - 1,
                                  })
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    _id: item._id,
                                    color: item.color,
                                    quantity: item.quantity + 1,
                                  })
                                )
                              }
                              disabled={item.quantity >= item.stock}
                              className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              dispatch(
                                removeFromCart({
                                  _id: item._id,
                                  color: item.color,
                                })
                              )
                            }
                            className="p-1.5 text-gray-400 hover:text-error transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-secondary">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Shipping & taxes calculated at checkout
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    onClick={() => dispatch(closeCart())}
                    className="btn btn-secondary text-center"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => dispatch(closeCart())}
                    className="btn btn-primary text-center"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

