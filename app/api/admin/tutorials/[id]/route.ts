import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authMiddleware } from "@/lib/auth";
import { extractYouTubeVideoId } from "@/lib/youtube";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control":
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = params;
    const body = await request.json();
    const {
      title,
      shortDescription,
      youtubeUrl,
      sortOrder: rawSort,
      isActive,
    } = body;

    const existing = await prisma.tutorial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Tutorial not found" }, { status: 404 });
    }

    const updateData: {
      title?: string;
      shortDescription?: string | null;
      youtubeUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    } = {};

    if (title !== undefined) {
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { message: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (shortDescription !== undefined) {
      updateData.shortDescription =
        typeof shortDescription === "string" && shortDescription.trim()
          ? shortDescription.trim()
          : null;
    }

    if (youtubeUrl !== undefined) {
      if (!youtubeUrl || typeof youtubeUrl !== "string" || youtubeUrl.trim().length === 0) {
        return NextResponse.json(
          { message: "YouTube link cannot be empty" },
          { status: 400 }
        );
      }
      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        return NextResponse.json(
          { message: "Could not parse a valid YouTube video from that link" },
          { status: 400 }
        );
      }
      updateData.youtubeUrl = youtubeUrl.trim();
    }

    if (rawSort !== undefined) {
      const n = Number(rawSort);
      updateData.sortOrder = Number.isFinite(n) ? Math.trunc(n) : 0;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const tutorial = await prisma.tutorial.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tutorial updated successfully",
        tutorial,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Error updating tutorial:", error);
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

    const existingTutorial = await prisma.tutorial.findUnique({
      where: { id },
    });
    if (!existingTutorial) {
      return NextResponse.json({ message: "Tutorial not found" }, { status: 404 });
    }

    const tutorial = await prisma.tutorial.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Tutorial ${isActive ? "activated" : "deactivated"} successfully`,
        tutorial,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Error updating tutorial status:", error);
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
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = params;

    const existing = await prisma.tutorial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Tutorial not found" }, { status: 404 });
    }

    await prisma.tutorial.delete({ where: { id } });

    return NextResponse.json(
      { success: true, message: "Tutorial deleted successfully" },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Error deleting tutorial:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
