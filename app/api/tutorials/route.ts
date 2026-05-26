import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  extractYouTubeVideoId,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
} from "@/lib/youtube";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const tutorials = await prisma.tutorial.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    const enriched = tutorials
      .map((t) => {
        const videoId = extractYouTubeVideoId(t.youtubeUrl);
        return {
          id: t.id,
          title: t.title,
          shortDescription: t.shortDescription,
          youtubeUrl: t.youtubeUrl,
          videoId,
          embedUrl: videoId ? youtubeEmbedUrl(videoId) : null,
          thumbnailUrl: videoId ? youtubeThumbnailUrl(videoId) : null,
        };
      })
      .filter((t) => t.videoId);

    return NextResponse.json({ tutorials: enriched });
  } catch (error) {
    console.error("Error fetching tutorials:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutorials" },
      { status: 500 }
    );
  }
}
