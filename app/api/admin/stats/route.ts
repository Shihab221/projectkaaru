import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { authMiddleware } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    // Get current date and date from 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total counts
    const [totalProducts, totalOrders, totalCustomers, totalRevenue] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$total" }
          }
        }
      ])
    ]);

    // Get counts from last 30 days
    const [recentProducts, recentOrders, recentCustomers, recentRevenue] = await Promise.all([
      Product.countDocuments({
        isActive: true,
        createdAt: { $gte: thirtyDaysAgo }
      }),
      Order.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      }),
      User.countDocuments({
        role: "user",
        createdAt: { $gte: thirtyDaysAgo }
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" }
          }
        }
      ])
    ]);

    // Calculate percentage changes (simplified - in a real app you'd compare with previous period)
    const calculateChange = (current: number, recent: number) => {
      if (current === 0) return "0%";
      const change = ((recent / current) * 100);
      return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
    };

    const stats = {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenue[0]?.total || 0,
      productsChange: calculateChange(totalProducts, recentProducts),
      ordersChange: calculateChange(totalOrders, recentOrders),
      customersChange: calculateChange(totalCustomers, recentCustomers),
      revenueChange: totalRevenue[0]?.total ?
        calculateChange(totalRevenue[0].total, recentRevenue[0]?.total || 0) : "0%",
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Fetch stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
