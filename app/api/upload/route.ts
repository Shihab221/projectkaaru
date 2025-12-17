import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadedImages: Array<{ data: string; contentType: string; filename: string }> = [];

    for (const file of files) {
      if (!file || file.size === 0) continue;

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only images are allowed.` },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit" },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Convert buffer to base64 for JSON serialization
      uploadedImages.push({
        data: buffer.toString('base64'),
        contentType: file.type,
        filename: file.name,
      });
    }

    console.log(`Successfully uploaded ${uploadedImages.length} images`);
    return NextResponse.json({
      message: "Files uploaded successfully",
      images: uploadedImages,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload files" },
      { status: 500 }
    );
  }
}

