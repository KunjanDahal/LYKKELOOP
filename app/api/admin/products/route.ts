import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { checkAdminAuth } from "@/lib/adminAuth";

const VALID_TYPES = ["earrings", "cap", "glooves", "keyring"] as const;

// GET - List all products for admin
export async function GET() {
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

    // Fetch all products
    const products = await Product.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      products: products.map((product) => ({
        _id: product._id.toString(),
        name: product.name,
        type: product.type,
        priceDkk: product.priceDkk,
        imageUrl: product.imageUrl,
        description: product.description,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, type, priceDkk, imageUrl, description } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Product type must be one of: earrings, cap, glooves, keyring" },
        { status: 400 }
      );
    }

    if (typeof priceDkk !== "number" || priceDkk <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    if (!imageUrl || imageUrl.trim().length === 0) {
      return NextResponse.json(
        { error: "Image URL is required" },
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

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Product description is required" },
        { status: 400 }
      );
    }

    // Create product
    const product = await Product.create({
      name: name.trim(),
      type,
      priceDkk,
      imageUrl: imageUrl.trim(),
      description: description.trim(),
    });

    // Return product
    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}


