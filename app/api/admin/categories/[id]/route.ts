import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authMiddleware } from "@/lib/auth";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

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

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { headers: noCacheHeaders }
    );
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

    const { id } = params;
    const body = await request.json();
    const { name, description, image, subcategories, isActive } = body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { message: "Category name is required" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
      // Regenerate slug when name changes
      updateData.slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (image !== undefined) {
      updateData.image = image?.trim() || null;
    }

    if (subcategories !== undefined) {
      updateData.subcategories = Array.isArray(subcategories)
        ? subcategories.filter(sub => sub && typeof sub === "string").map(sub => sub.trim())
        : [];
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
        category,
      },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error("Error updating category:", error);

    // Handle unique constraint violations
    if (error.code === "P2002") {
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

    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json(
        { message: "isActive field is required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Category ${isActive ? "activated" : "deactivated"} successfully`,
        category,
      },
      { headers: noCacheHeaders }
    );
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

    const { id } = params;

    // Check if category exists and get it before deletion
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // TODO: Check if category is being used by any products before deleting
    // For now, we'll allow deletion but this should be enhanced

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
