import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authMiddleware } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get current date and date from 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total counts using Prisma
    const [totalProducts, totalOrders, totalCustomers, totalRevenue] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "user" } }),
      prisma.order.aggregate({
        _sum: {
          total: true
        }
      })
    ]);

    // Get counts from last 30 days
    const [recentProducts, recentOrders, recentCustomers, recentRevenue] = await Promise.all([
      prisma.product.count({
        where: {
          isActive: true,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.user.count({
        where: {
          role: "user",
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        },
        _sum: {
          total: true
        }
      })
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
      totalRevenue: totalRevenue._sum.total || 0,
      productsChange: calculateChange(totalProducts, recentProducts),
      ordersChange: calculateChange(totalOrders, recentOrders),
      customersChange: calculateChange(totalCustomers, recentCustomers),
      revenueChange: totalRevenue._sum.total ?
        calculateChange(totalRevenue._sum.total, recentRevenue._sum.total || 0) : "0%",
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
