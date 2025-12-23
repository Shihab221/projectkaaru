import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const payload = await getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      itemsTotal,
      shippingCost,
      discount,
      paymentProcessingFee,
      total,
      notes,
      transactionId,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Validate and update product stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.product} not found` },
          { status: 400 }
        );
      }

      // Check stock based on size or default stock
      let availableStock = product.stock || 1000;
      if (item.size && product.sizes) {
        const sizeData = product.sizes.find(s => s.name === item.size);
        if (sizeData) {
          availableStock = sizeData.stock || 1000;
        }
      }

      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}${item.size ? ` (${item.size})` : ''}` },
          { status: 400 }
        );
      }

      // Update stock based on size
      if (item.size && product.sizes) {
        const sizeIndex = product.sizes.findIndex(s => s.name === item.size);
        if (sizeIndex !== -1) {
          product.sizes[sizeIndex].stock = (product.sizes[sizeIndex].stock || 1000) - item.quantity;
        }
      } else {
        product.stock = (product.stock || 1000) - item.quantity;
      }

      // Update sold count
      product.sold += item.quantity;
      await product.save();
    }

    // Generate unique order number
    const generateOrderNumber = () => {
      const date = new Date();
      const timestamp = date.getTime();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      return `PK${timestamp}${randomSuffix}`;
    };

    let orderNumber = generateOrderNumber();
    let order;

    // Try to create order, retry if order number is duplicate
    for (let attempts = 0; attempts < 5; attempts++) {
      try {
        order = await Order.create({
          orderNumber,
          user: payload.userId,
          items,
          shippingAddress,
          paymentMethod,
          paymentStatus,
          itemsTotal,
          shippingCost,
          discount,
          paymentProcessingFee,
          total,
          notes,
          transactionId,
        });
        break; // Success
      } catch (error: any) {
        // Check if it's a duplicate key error
        if (error.code === 11000 && error.message.includes('orderNumber')) {
          // Generate new order number and retry
          orderNumber = generateOrderNumber();
          continue;
        }
        // Re-throw other errors
        throw error;
      }
    }

    if (!order) {
      throw new Error("Failed to create order after multiple attempts");
    }

    // Populate order with product and user details
    await order.populate([
      { path: "user", select: "name email" },
      { path: "items.product", select: "name slug images" },
    ]);

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
