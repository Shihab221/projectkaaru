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

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const tutorials = await prisma.tutorial.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      { success: true, tutorials },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Error fetching tutorials:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, true);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const {
      title,
      shortDescription,
      youtubeUrl,
      sortOrder: rawSort,
    }: {
      title?: string;
      shortDescription?: string;
      youtubeUrl?: string;
      sortOrder?: unknown;
    } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    if (!youtubeUrl || typeof youtubeUrl !== "string" || youtubeUrl.trim().length === 0) {
      return NextResponse.json(
        { message: "YouTube link is required" },
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

    let sortOrder = 0;
    if (rawSort !== undefined && rawSort !== null && rawSort !== "") {
      const n = Number(rawSort);
      if (Number.isFinite(n)) {
        sortOrder = Math.trunc(n);
      }
    }

    const tutorial = await prisma.tutorial.create({
      data: {
        title: title.trim(),
        shortDescription:
          typeof shortDescription === "string" && shortDescription.trim()
            ? shortDescription.trim()
            : null,
        youtubeUrl: youtubeUrl.trim(),
        sortOrder,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tutorial added successfully",
        tutorial,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Error creating tutorial:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
