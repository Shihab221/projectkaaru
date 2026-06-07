import { NextResponse } from "next/server";

export async function GET() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  return NextResponse.json({
    pixelId: pixelId ? `${pixelId.substring(0, 4)}****${pixelId.substring(pixelId.length - 4)}` : null,
    accessToken: accessToken ? `${accessToken.substring(0, 10)}****` : null,
    nodeEnv: process.env.NODE_ENV,
    hasPixelId: !!pixelId,
    hasAccessToken: !!accessToken,
    timestamp: new Date().toISOString(),
  });
}