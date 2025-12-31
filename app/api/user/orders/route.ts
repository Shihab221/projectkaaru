export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getUserFromRequest(request);

    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: payload.userId },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            name: true,
            image: true,
            price: true,
            quantity: true,
            size: true,
            color: true,
            backgroundColor: true,
            borderColor: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch user orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}



