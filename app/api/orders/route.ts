import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const payload = await getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus = "pending",
      itemsTotal,
      shippingCost,
      discount = 0,
      paymentProcessingFee = 0,
      total,
      notes,
      transactionId,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Use Prisma transaction to ensure data consistency with increased timeout
    const result = await prisma.$transaction(async (tx) => {
      // First, validate stock for all items in one query
      const productIds = items.map(item => item.product);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { sizes: true }
      });

      // Create a map for quick lookup
      const productMap = new Map(products.map(p => [p.id, p]));

      // Validate stock for each item
      for (const item of items) {
        const product = productMap.get(item.product);
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }

        // Check stock based on size or default stock
        let availableStock = product.stock;
        if (item.size && product.sizes) {
          const sizeData = product.sizes.find(s => s.name === item.size);
          if (sizeData) {
            availableStock = sizeData.stock;
          }
        }

        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}${item.size ? ` (${item.size})` : ''}`);
        }
      }

      // Update stock and sold count for each product (batch operations where possible)
      for (const item of items) {
        // Update product stock
        if (item.size) {
          // Update size-specific stock
          await tx.productSize.updateMany({
            where: {
              productId: item.product,
              name: item.size
            },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        } else {
          // Update main product stock
          await tx.product.update({
            where: { id: item.product },
            data: {
              stock: {
                decrement: item.quantity
              },
              sold: {
                increment: item.quantity
              }
            }
          });
          continue; // Skip the separate sold update since we did it above
        }

        // Update sold count (only for size-specific products)
        await tx.product.update({
          where: { id: item.product },
          data: {
            sold: {
              increment: item.quantity
            }
          }
        });
      }

      // Generate unique order number (more efficient)
      const generateOrderNumber = () => {
        const date = new Date();
        const timestamp = date.getTime();
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
        return `PK${timestamp}${randomSuffix}`;
      };

      let orderNumber;
      let attempts = 0;
      do {
        orderNumber = generateOrderNumber();
        const existingOrder = await tx.order.findUnique({
          where: { orderNumber }
        });
        if (!existingOrder) break;
        attempts++;
      } while (attempts < 10); // Allow more attempts but should be very rare

      if (attempts >= 10) {
        throw new Error("Failed to generate unique order number after multiple attempts");
      }

      // Create order with shipping address
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: payload.userId,
          paymentMethod: paymentMethod || "cod",
          paymentStatus: paymentStatus as any,
          itemsTotal,
          shippingCost,
          discount,
          paymentProcessingFee,
          total,
          status: "pending",
          notes,
          shippingAddress: {
            create: {
              name: shippingAddress.name,
              phone: shippingAddress.phone,
              street: shippingAddress.street,
              city: shippingAddress.city,
              state: shippingAddress.state || "",
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country || "Bangladesh",
            }
          },
          items: {
            create: items.map((item: any) => ({
              productId: item.product,
              name: item.name,
              image: item.image,
              price: item.price,
              quantity: item.quantity,
              color: item.color || null,
              font: item.font || null,
              size: item.size || null,
              backgroundColor: item.backgroundColor || null,
              borderColor: item.borderColor || null,
            }))
          }
        },
        include: {
          shippingAddress: true,
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true }
              }
            }
          }
        }
      });

      return order;
    }, { timeout: 15000 }); // Increase timeout to 15 seconds

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: {
          id: result.id,
          orderNumber: result.orderNumber,
          status: result.status,
          total: result.total,
          createdAt: result.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
