import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "projectkaru-secret-key-2024"
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
  iat?: number;
  exp?: number;
}

// Generate JWT token
export async function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Get user from request (server-side)
export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

// Get user from cookies (server component)
export async function getUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

// Check if user is admin
export async function isAdmin(request: NextRequest): Promise<boolean> {
  const user = await getUserFromRequest(request);
  return user?.role === "admin";
}

// Auth middleware for API routes
export async function authMiddleware(
  request: NextRequest,
  requireAdmin: boolean = false
): Promise<{ user: JWTPayload } | NextResponse> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized - Please login" },
      { status: 401 }
    );
  }

  if (requireAdmin && user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  return { user };
}

// Set auth cookie
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Remove auth cookie
export function removeAuthCookie(response: NextResponse): void {
  response.cookies.delete("token");
}

