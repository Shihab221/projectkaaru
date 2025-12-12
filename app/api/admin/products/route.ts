import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { authMiddleware } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";

// Create new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    const body = await request.json();
    const {
      name,
      description,
      shortDescription,
      price,
      discountedPrice,
      category,
      subcategory,
      images,
      stock,
      colors,
      isTopProduct,
    } = body;

    // Validate required fields
    if (!name || !description || !price || !category || !stock) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(name);
    
    // Check if slug exists and make it unique
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      description,
      shortDescription,
      price,
      discountedPrice: discountedPrice || undefined,
      category,
      subcategory,
      images: images || [],
      stock,
      colors: colors || [],
      isTopProduct: isTopProduct || false,
    });

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

// Get all products (Admin - includes inactive)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    const products = await Product.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Fetch admin products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

