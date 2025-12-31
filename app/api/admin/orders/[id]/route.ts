export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authMiddleware } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true, discountedPrice: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { status, paymentStatus, trackingNumber, notes } = await request.json();

    const updateData: Record<string, any> = {};

    if (status) {
      const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateData.status = status;

      // Set deliveredAt when status is delivered
      if (status === "delivered") {
        updateData.deliveredAt = new Date();
      }
    }

    if (paymentStatus) {
      const validPaymentStatuses = ["pending", "paid", "failed"];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
      }
      updateData.paymentStatus = paymentStatus;
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true, discountedPrice: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: "Order updated successfully",
      order,
    });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
































