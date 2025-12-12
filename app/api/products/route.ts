export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    // Build query
    const query: any = { isActive: true };

    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Subcategory filter
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Price range filter
    if (minPrice > 0 || maxPrice > 0) {
      query.$and = query.$and || [];
      if (minPrice > 0) {
        query.$and.push({
          $or: [
            { discountedPrice: { $gte: minPrice } },
            { price: { $gte: minPrice } },
          ],
        });
      }
      if (maxPrice > 0) {
        query.$and.push({
          $or: [
            { discountedPrice: { $lte: maxPrice } },
            { price: { $lte: maxPrice } },
          ],
        });
      }
    }

    // On sale filter
    if (onSale) {
      query.discountedPrice = { $exists: true, $gt: 0 };
      query.$expr = { $lt: ["$discountedPrice", "$price"] };
    }

    // Top product filter
    if (isTopProduct) {
      query.isTopProduct = true;
    }

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case "price-low":
        sort = { discountedPrice: 1, price: 1 };
        break;
      case "price-high":
        sort = { discountedPrice: -1, price: -1 };
        break;
      case "popular":
        sort = { sold: -1 };
        break;
      case "rating":
        sort = { averageRating: -1 };
        break;
      case "newest":
      default:
        sort = { createdAt: -1 };
    }

    // Execute query
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

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

