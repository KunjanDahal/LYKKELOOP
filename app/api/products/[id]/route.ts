import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId format
    if (!id || id.length !== 24) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Fetch product
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Return safe fields
    const safeProduct = {
      _id: product._id.toString(),
      name: product.name,
      type: product.type,
      priceDkk: product.priceDkk,
      imageUrl: product.imageUrl,
      description: product.description,
    };

    return NextResponse.json(safeProduct, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}


