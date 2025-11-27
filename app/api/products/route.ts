import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// Mark route as dynamic since it uses request.url and queries database
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Build query
    const query = type
      ? { type: type as "earrings" | "cap" | "glooves" | "keyring" }
      : {};

    // Fetch products
    const products = await Product.find(query).sort({ createdAt: -1 });

    // Return safe fields
    const safeProducts = products.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      type: product.type,
      priceDkk: product.priceDkk,
      imageUrl: product.imageUrl,
      description: product.description,
    }));

    return NextResponse.json(safeProducts, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}


