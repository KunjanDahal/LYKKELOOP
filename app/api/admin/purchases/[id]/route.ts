import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import { checkAdminAuth } from "@/lib/adminAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// PATCH - Update purchase verification status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid purchase ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { verificationStatus } = body;

    const validStatuses = ["pending", "received", "not_received"];
    if (!verificationStatus || !validStatuses.includes(verificationStatus)) {
      return NextResponse.json(
        { error: "Invalid verification status" },
        { status: 400 }
      );
    }

    const purchase = await Purchase.findByIdAndUpdate(
      id,
      { verificationStatus },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("productId", "name");

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Purchase updated successfully",
      purchase: {
        id: purchase._id.toString(),
        userId: (purchase.userId as any)?._id?.toString(),
        userName: (purchase.userId as any)?.name,
        userEmail: (purchase.userId as any)?.email,
        productId: purchase.productId.toString(),
        productName: purchase.productName,
        productType: purchase.productType,
        price: purchase.price,
        verificationStatus: purchase.verificationStatus,
        createdAt: purchase.createdAt,
        updatedAt: purchase.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Update purchase error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update purchase" },
      { status: 500 }
    );
  }
}
