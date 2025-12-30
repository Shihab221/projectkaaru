export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || String(PRODUCTS_PER_PAGE));
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const search = searchParams.get("search");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
    const onSale = searchParams.get("onSale") === "true";
    const isTopProduct = searchParams.get("isTopProduct") === "true";
    const sortBy = searchParams.get("sortBy") || "newest";

    // Build where clause
    const where: any = { isActive: true };

    // Category filter
    if (category) {
      const categoryDoc = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true }
      });
      if (categoryDoc) {
        where.categoryId = categoryDoc.id;
      }
    }

    // Subcategory filter
    if (subcategory) {
      where.subcategory = subcategory;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Price range filter
    if (minPrice > 0 || maxPrice > 0) {
      where.AND = where.AND || [];
      if (minPrice > 0) {
        where.AND.push({
          OR: [
            { discountedPrice: { gte: minPrice } },
            { price: { gte: minPrice } },
          ],
        });
      }
      if (maxPrice > 0) {
        where.AND.push({
          OR: [
            { discountedPrice: { lte: maxPrice } },
            { price: { lte: maxPrice } },
          ],
        });
      }
    }

    // On sale filter
    if (onSale) {
      where.discountedPrice = { not: null, gt: 0 };
      // Note: Prisma doesn't have direct equivalent for $expr, we'll need to handle this differently
    }

    // Top product filter
    if (isTopProduct) {
      where.isTopProduct = true;
    }

    // Build orderBy
    let orderBy: any;
    switch (sortBy) {
      case "price-low":
        orderBy = [
          { discountedPrice: "asc" },
          { price: "asc" }
        ];
        break;
      case "price-high":
        orderBy = [
          { discountedPrice: "desc" },
          { price: "desc" }
        ];
        break;
      case "popular":
        orderBy = { sold: "desc" };
        break;
      case "rating":
        orderBy = { averageRating: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    // Execute query
    const skip = (page - 1) * limit;
    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        sizes: true,
        _count: {
          select: { reviews: true }
        }
      },
      orderBy,
      skip,
      take: limit,
    });

    return NextResponse.json({
      products,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

