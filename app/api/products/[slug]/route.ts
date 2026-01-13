import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Validate slug parameter
    if (!params.slug || typeof params.slug !== 'string') {
      return NextResponse.json(
        { error: "Invalid product slug" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        slug: params.slug,
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        sizes: true,
        images: true,
      }
    });

    if (!product) {
      console.log(`Product not found for slug: ${params.slug}`);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch related products (with error handling)
    let relatedProducts = [];
    try {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          shortDescription: true,
          price: true,
          discountedPrice: true,
          stock: true,
          isTopProduct: true,
          category: {
            select: { id: true, name: true, slug: true }
          },
          images: true, // Include images for related products
        },
        take: 4,
      });
    } catch (relatedError) {
      console.warn("Error fetching related products:", relatedError);
      // Continue without related products rather than failing the whole request
    }

    return NextResponse.json({
      product,
      relatedProducts,
    });
  } catch (error: any) {
    console.error("Fetch product error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

