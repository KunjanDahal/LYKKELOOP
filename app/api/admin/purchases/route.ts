import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import Product from "@/models/Product";
import User from "@/models/User";
import { checkAdminAuth } from "@/lib/adminAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// GET - Get all purchases for admin
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchases = await Purchase.find()
      .populate("userId", "name email")
      .populate("productId", "name images imageUrl")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      purchases: purchases.map((p) => ({
        id: p._id.toString(),
        userId: (p.userId as any)?._id?.toString(),
        userName: (p.userId as any)?.name,
        userEmail: (p.userId as any)?.email,
        productId: p.productId.toString(),
        productName: p.productName,
        productType: p.productType,
        price: p.price,
        verificationStatus: p.verificationStatus,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("Get admin purchases error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
