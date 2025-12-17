import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

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

    await connectDB();

    const product = await Product.findOne({
      slug: params.slug,
      isActive: true,
    })
      .populate("category", "name slug")
      .populate("reviews.user", "name")
      .lean();

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
      relatedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: product._id },
        isActive: true,
      })
        .limit(4)
        .populate("category", "name slug")
        .lean();
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

    // Return appropriate error status
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

