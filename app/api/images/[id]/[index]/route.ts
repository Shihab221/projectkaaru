import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; index: string } }
) {
  try {
    const { id, index } = params;
    const imageIndex = parseInt(index);

    if (isNaN(imageIndex) || imageIndex < 0) {
      return NextResponse.json({ error: "Invalid image index" }, { status: 400 });
    }

    // Get the product image from database
    const image = await prisma.productImage.findFirst({
      where: {
        productId: id,
      },
      skip: imageIndex,
      take: 1,
      orderBy: {
        id: 'asc' // Order by ID to get consistent ordering
      }
    });

    if (!image) {
      // Return a fallback transparent PNG
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      return new NextResponse(transparentPng, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error: any) {
    console.error("Image fetch error:", error);

    // Return fallback image on error
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    return new NextResponse(transparentPng, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}
