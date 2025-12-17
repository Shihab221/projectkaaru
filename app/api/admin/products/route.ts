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

    // Generate slug
    let slug = generateSlug(name);
    
    // Check if slug exists and make it unique
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    // Convert base64 image data back to Buffer for MongoDB storage
    const processedImages = (uploadedImages || []).map((img: any) => {
      if (img && img.data && typeof img.data === 'string') {
        // Convert base64 string back to Buffer
        return {
          data: Buffer.from(img.data, 'base64'),
          contentType: img.contentType,
          filename: img.filename,
        };
      }
      return img;
    });

    // Prepare product data
    const productData: any = {
      name,
      slug,
      description,
      shortDescription,
      price,
      discountedPrice: discountedPrice || undefined,
      category,
      subcategory,
      images: processedImages,
      isTopProduct: isTopProduct || false,
    };

    // Handle sizes and stock
    if (sizes && sizes.length > 0) {
      // If sizes are provided, use them and ignore single stock
      productData.sizes = sizes.map((size: any) => ({
        name: size.name,
        price: size.price,
        discountedPrice: size.discountedPrice || undefined,
        stock: size.stock !== undefined ? size.stock : 1000,
      }));
      // Set single stock to sum of all sizes for backward compatibility
      productData.stock = productData.sizes.reduce((total: number, size: any) => total + (size.stock || 1000), 0);
    } else {
      // If no sizes, use single stock (default to 1000 if not provided)
      productData.stock = stock !== undefined ? stock : 1000;
    }

    // Add colors if provided
    if (backgroundColors && backgroundColors.length > 0) {
      productData.backgroundColors = backgroundColors;
    }
    if (borderColors && borderColors.length > 0) {
      productData.borderColors = borderColors;
    }

    // Create product
    console.log('Creating product with data:', {
      ...productData,
      images: productData.images ? `${productData.images.length} images` : 'no images'
    });
    const product = await Product.create(productData);
    console.log('Product created with ID:', product._id);

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

