import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; index: string } }
) {
  try {
    await connectDB();

    // Validate that the ID is a valid ObjectId
    if (!params.id || !/^[0-9a-fA-F]{24}$/.test(params.id)) {
      // Return a fallback image for invalid IDs
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      return new NextResponse(transparentPng, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    let product;
    try {
      product = await Product.findById(params.id);
    } catch (dbError: any) {
      console.error('Database error fetching product:', dbError);
      // Return a fallback image for database errors
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      return new NextResponse(transparentPng, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    if (!product) {
      console.error('Product not found for ID:', params.id);
      // Return a 1x1 transparent PNG as fallback
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      return new NextResponse(transparentPng, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      });
    }

    const imageIndex = parseInt(params.index);
    if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= product.images.length) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const image = product.images[imageIndex];

    // Handle new binary format (MongoDB stored images)
    if (image && typeof image === 'object' && image.contentType) {
      let imageData = image.data;
      
      // Handle MongoDB Binary type
      if (imageData && imageData.buffer) {
        imageData = Buffer.from(imageData.buffer);
      } else if (imageData && typeof imageData === 'object' && imageData.type === 'Buffer' && imageData.data) {
        // Handle serialized buffer
        imageData = Buffer.from(imageData.data);
      } else if (Buffer.isBuffer(imageData)) {
        // Already a buffer, use as is
      } else {
        // Fallback
        imageData = Buffer.from(imageData);
      }

      return new NextResponse(imageData, {
        headers: {
          'Content-Type': image.contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    }

    // Handle old string URL format (for backward compatibility)
    if (typeof image === 'string') {
      // If it's a full URL, redirect to it
      if (image.startsWith('http')) {
        return NextResponse.redirect(image);
      }
      // If it's a relative path, serve it from public folder
      // This handles old /uploads/ paths
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      const fullUrl = `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`;
      return NextResponse.redirect(fullUrl);
    }

    // Fallback: return a 404 if image format is invalid
    return NextResponse.json({ error: "Invalid image format" }, { status: 404 });
  } catch (error: any) {
    console.error("Image fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
