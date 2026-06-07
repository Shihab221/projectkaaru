import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    console.log("🔍 Testing PostgreSQL/Prisma connection...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DIRECT_URL exists:", !!process.env.DIRECT_URL);

    // Test database connection
    await prisma.$connect();

    // Test a simple query
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();

    return NextResponse.json({
      status: "success",
      message: "PostgreSQL/Prisma connection successful",
      data: {
        userCount,
        productCount,
        orderCount,
      },
      timestamp: new Date().toISOString(),
      database_url: process.env.DATABASE_URL ? "URI exists" : "URI missing",
      direct_url: process.env.DIRECT_URL ? "URI exists" : "URI missing"
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return NextResponse.json({
      status: "error",
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      database_url: process.env.DATABASE_URL ? "URI exists" : "URI missing",
      direct_url: process.env.DIRECT_URL ? "URI exists" : "URI missing"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}



