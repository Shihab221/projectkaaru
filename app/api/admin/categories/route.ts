import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { authMiddleware } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    const categories = await Category.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    const body = await request.json();
    const { name, description, image, subcategories = [] } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category with this name already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const category = new Category({
      name: name.trim(),
      slug,
      description: description?.trim() || undefined,
      image: image?.trim() || undefined,
      subcategories: Array.isArray(subcategories)
        ? subcategories.filter(sub => sub && typeof sub === "string").map(sub => sub.trim())
        : [],
    });

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error: any) {
    console.error("Error creating category:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Category with this name or slug already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
