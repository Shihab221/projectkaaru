import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authMiddleware } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin auth
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        sizes: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        images: true,
        _count: {
          select: { reviews: true }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin auth
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { message: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Update product active status
    const product = await prisma.product.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin auth
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = params;

    // Check if product exists and get related record counts
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        isActive: true,
        _count: {
          select: {
            orderItems: true,
            reviews: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product has order items and is active (can delete inactive products)
    if (product._count.orderItems > 0 && product.isActive) {
      return NextResponse.json(
        {
          message: "Cannot delete active product that has been ordered. Deactivate it first, then delete.",
          orderCount: product._count.orderItems,
          suggestion: "deactivate"
        },
        { status: 400 }
      );
    }

    // Delete reviews first (cascade won't handle this automatically)
    if (product._count.reviews > 0) {
      await prisma.review.deleteMany({
        where: { productId: id }
      });
    }

    // Delete the product (cascade will handle ProductSize and ProductImage)
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
