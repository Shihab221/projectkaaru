export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const payload = await getUserFromRequest(request);

    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, phone, address } = await request.json();

    // Validate name
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address ? {
          upsert: {
            create: {
              street: address.street || "",
              city: address.city || "",
              state: address.state || "",
              postalCode: address.postalCode || "",
              country: address.country || "Bangladesh",
            },
            update: {
              street: address.street || "",
              city: address.city || "",
              state: address.state || "",
              postalCode: address.postalCode || "",
              country: address.country || "Bangladesh",
            }
          }
        } : undefined,
      },
      include: {
        address: true,
      }
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getUserFromRequest(request);

    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        address: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
































