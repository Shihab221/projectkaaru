import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import mongoose from "mongoose";
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

    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid category ID" },
        { status: 400 }
      );
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin auth
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid category ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, image, subcategories, isActive } = body;

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (name !== undefined) {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { message: "Category name is required" },
          { status: 400 }
        );
      }
      category.name = name.trim();
      // Regenerate slug when name changes
      category.slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    if (description !== undefined) {
      category.description = description?.trim() || undefined;
    }

    if (image !== undefined) {
      category.image = image?.trim() || undefined;
    }

    if (subcategories !== undefined) {
      category.subcategories = Array.isArray(subcategories)
        ? subcategories.filter(sub => sub && typeof sub === "string").map(sub => sub.trim())
        : [];
    }

    if (isActive !== undefined) {
      category.isActive = Boolean(isActive);
    }

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error: any) {
    console.error("Error updating category:", error);

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

    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid category ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json(
        { message: "isActive field is required" },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: Boolean(isActive) },
      { new: true }
    ).lean();

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Category ${isActive ? "activated" : "deactivated"} successfully`,
      category,
    });
  } catch (error) {
    console.error("Error updating category status:", error);
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

    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // TODO: Check if category is being used by any products before deleting
    // For now, we'll allow deletion but this should be enhanced

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
