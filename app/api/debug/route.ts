import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET() {
  try {
    console.log("🔍 Testing MongoDB connection...");
    console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log("MONGODB_URI starts with:", process.env.MONGODB_URI?.substring(0, 20) + "...");

    await connectDB();
    return NextResponse.json({
      status: "success",
      message: "MongoDB connection successful",
      timestamp: new Date().toISOString(),
      uri: process.env.MONGODB_URI ? "URI exists" : "URI missing"
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    return NextResponse.json({
      status: "error",
      message: "MongoDB connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      uri: process.env.MONGODB_URI ? "URI exists" : "URI missing"
    }, { status: 500 });
  }
}



