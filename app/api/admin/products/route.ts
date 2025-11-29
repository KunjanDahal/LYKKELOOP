import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { checkAdminAuth } from "@/lib/adminAuth";
import { validateImageFiles, filesToBase64, MAX_FILE_SIZE } from "@/lib/imageUtils.server";

// Mark route as dynamic and use Node.js runtime (required for MongoDB and cookies)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

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
        images: product.images || [],
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

    // Parse FormData
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const priceDkkStr = formData.get("priceDkk") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string | null; // For backward compatibility
    const imageFiles = formData.getAll("images") as File[];

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!type || !VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
      return NextResponse.json(
        { error: "Product type must be one of: earrings, cap, glooves, keyring" },
        { status: 400 }
      );
    }

    const priceDkk = parseFloat(priceDkkStr);
    if (isNaN(priceDkk) || priceDkk <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Product description is required" },
        { status: 400 }
      );
    }

    // Filter out empty files
    const validImageFiles = imageFiles.filter(file => file && file.size > 0);
    
    let images: string[] = [];
    let imageUrlToStore: string | undefined = undefined;

    // Handle image uploads
    if (validImageFiles.length > 0) {
      // Validate uploaded images
      const validation = validateImageFiles(validImageFiles);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Convert files to base64
      images = await filesToBase64(validImageFiles);
    } else if (imageUrl && imageUrl.trim().length > 0) {
      // Backward compatibility: use imageUrl if no files uploaded
      try {
        new URL(imageUrl.trim());
        imageUrlToStore = imageUrl.trim();
      } catch {
        return NextResponse.json(
          { error: "Image URL must be a valid URL" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Please upload 2-4 images or provide an image URL" },
        { status: 400 }
      );
    }

    // Create product
    const productData: any = {
      name: name.trim(),
      type: type as typeof VALID_TYPES[number],
      priceDkk,
      description: description.trim(),
    };

    if (images.length > 0) {
      productData.images = images;
      // Don't set imageUrl at all when using images array
    } else if (imageUrlToStore) {
      productData.imageUrl = imageUrlToStore;
      productData.images = []; // Empty array when using imageUrl
    }

    const product = await Product.create(productData);

    // Return product
    return NextResponse.json(
      {
        product: {
          _id: product._id.toString(),
          name: product.name,
          type: product.type,
          priceDkk: product.priceDkk,
          imageUrl: product.imageUrl,
          images: product.images || [],
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



