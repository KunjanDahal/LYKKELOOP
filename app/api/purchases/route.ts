import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import { getAuthUser } from "@/lib/auth";
import { checkAdminAuth } from "@/lib/adminAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// POST - Create a new purchase
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, productName, productType, price } = body;

    // Validation
    if (!productId || !productName || !productType || price === undefined) {
      return NextResponse.json(
        { error: "Product ID, name, type, and price are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    const validTypes = ["earrings", "cap", "glooves", "keyring"];
    if (!validTypes.includes(productType)) {
      return NextResponse.json(
        { error: "Invalid product type" },
        { status: 400 }
      );
    }

    // Create purchase
    const purchase = await Purchase.create({
      userId: new mongoose.Types.ObjectId(authUser.userId),
      productId: new mongoose.Types.ObjectId(productId),
      productName: productName.trim(),
      productType,
      price,
      verificationStatus: "pending",
    });

    return NextResponse.json(
      {
        message: "Purchase created successfully",
        purchase: {
          id: purchase._id.toString(),
          productId: purchase.productId.toString(),
          productName: purchase.productName,
          productType: purchase.productType,
          price: purchase.price,
          verificationStatus: purchase.verificationStatus,
          createdAt: purchase.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create purchase error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create purchase" },
      { status: 500 }
    );
  }
}

// GET - Get purchases (user gets their own, admin gets all)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const isAdmin = await checkAdminAuth();
    const authUser = await getAuthUser();

    if (!isAdmin && !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let purchases;
    if (isAdmin) {
      // Admin gets all purchases
      purchases = await Purchase.find()
        .populate("userId", "name email")
        .populate("productId", "name")
        .sort({ createdAt: -1 });
    } else {
      // User gets only their purchases
      purchases = await Purchase.find({
        userId: new mongoose.Types.ObjectId(authUser!.userId),
      })
        .populate("productId", "name")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      purchases: purchases.map((p) => ({
        id: p._id.toString(),
        productId: p.productId.toString(),
        productName: p.productName,
        productType: p.productType,
        price: p.price,
        verificationStatus: p.verificationStatus,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        ...(isAdmin && {
          userId: (p.userId as any)?._id?.toString(),
          userName: (p.userId as any)?.name,
          userEmail: (p.userId as any)?.email,
        }),
      })),
    });
  } catch (error: any) {
    console.error("Get purchases error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
