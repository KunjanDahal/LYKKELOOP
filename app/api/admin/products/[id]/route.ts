import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { checkAdminAuth } from "@/lib/adminAuth";

// Mark route as dynamic and use Node.js runtime (required for MongoDB and cookies)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const VALID_TYPES = ["earrings", "cap", "glooves", "keyring"] as const;

// PATCH - Update a product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;

    // Validate ObjectId format
    if (!id || id.length !== 24) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, type, priceDkk, imageUrl, description } = body;

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validation for provided fields
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Product name cannot be empty" },
          { status: 400 }
        );
      }
      product.name = name.trim();
    }

    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json(
          { error: "Product type must be one of: earrings, cap, glooves, keyring" },
          { status: 400 }
        );
      }
      product.type = type;
    }

    if (priceDkk !== undefined) {
      if (typeof priceDkk !== "number" || priceDkk <= 0) {
        return NextResponse.json(
          { error: "Price must be a positive number" },
          { status: 400 }
        );
      }
      product.priceDkk = priceDkk;
    }

    if (imageUrl !== undefined) {
      if (!imageUrl || imageUrl.trim().length === 0) {
        return NextResponse.json(
          { error: "Image URL cannot be empty" },
          { status: 400 }
        );
      }
      // Basic URL validation
      try {
        new URL(imageUrl);
      } catch {
        return NextResponse.json(
          { error: "Image URL must be a valid URL" },
          { status: 400 }
        );
      }
      product.imageUrl = imageUrl.trim();
    }

    if (description !== undefined) {
      if (!description || description.trim().length === 0) {
        return NextResponse.json(
          { error: "Product description cannot be empty" },
          { status: 400 }
        );
      }
      product.description = description.trim();
    }

    // Save updated product
    await product.save();

    // Return updated product
    return NextResponse.json({
      product: {
        _id: product._id.toString(),
        name: product.name,
        type: product.type,
        priceDkk: product.priceDkk,
        imageUrl: product.imageUrl,
        description: product.description,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;

    // Validate ObjectId format
    if (!id || id.length !== 24) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Find and delete product
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}



