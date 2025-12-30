import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
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

    const body = await request.json();
    const {
      name,
      description,
      shortDescription,
      price,
      discountedPrice,
      category,
      images: uploadedImages,
      stock,
      sizes,
      backgroundColors,
      borderColors,
      isTopProduct,
    } = body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that if sizes are provided, they must have required fields
    if (sizes && sizes.length > 0) {
      for (const size of sizes) {
        if (!size.name || !size.price) {
          return NextResponse.json(
            { error: "Each size must have a name and price" },
            { status: 400 }
          );
        }
      }
    }

    // Generate slug and ensure uniqueness
    let slug = generateSlug(name);
    let existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create the product without transaction to avoid timeout issues
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription: shortDescription || null,
        price: parseFloat(price),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        categoryId: category,
        stock: stock ? parseInt(stock) : 1000,
        backgroundColors: backgroundColors || [],
        borderColors: borderColors || [],
        isTopProduct: isTopProduct || false,
      },
    });

    // Create sizes if provided
    if (sizes && sizes.length > 0) {
      await prisma.productSize.createMany({
        data: sizes.map((size: any) => ({
          productId: product.id,
          name: size.name,
          price: parseFloat(size.price),
          discountedPrice: size.discountedPrice ? parseFloat(size.discountedPrice) : null,
          stock: size.stock ? parseInt(size.stock) : 1000,
        }))
      });
    }

    // Create images if provided
    if (uploadedImages && uploadedImages.length > 0) {
      await prisma.productImage.createMany({
        data: uploadedImages.map((img: any) => ({
          productId: product.id,
          filename: img.filename,
          contentType: img.contentType,
          data: Buffer.from(img.data, 'base64'),
        }))
      });
    }

    // Fetch the complete product with relations
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        sizes: true,
        images: true,
      }
    });

    return NextResponse.json(
      { message: "Product created successfully", product: completeProduct },
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

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        sizes: true,
        images: true,
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Fetch admin products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

