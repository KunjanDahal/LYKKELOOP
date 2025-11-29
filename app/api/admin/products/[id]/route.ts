import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { checkAdminAuth } from "@/lib/adminAuth";
import { validateImageFiles, filesToBase64 } from "@/lib/imageUtils.server";

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

    // Check if request is FormData or JSON
    const contentType = request.headers.get("content-type") || "";
    let name: string | undefined;
    let type: string | undefined;
    let priceDkk: number | undefined;
    let description: string | undefined;
    let imageUrl: string | undefined;
    let imageFiles: File[] = [];
    let existingImages: string[] = [];
    let deleteImages: boolean = false;

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData
      const formData = await request.formData();
      name = formData.get("name") as string | undefined;
      type = formData.get("type") as string | undefined;
      const priceDkkStr = formData.get("priceDkk") as string | undefined;
      description = formData.get("description") as string | undefined;
      imageUrl = formData.get("imageUrl") as string | undefined;
      const deleteImagesStr = formData.get("deleteImages") as string | undefined;
      deleteImages = deleteImagesStr === "true";
      imageFiles = formData.getAll("images") as File[];
      
      // Extract existing images (sent as base64 strings)
      existingImages = formData.getAll("existingImages") as string[];

      if (priceDkkStr !== undefined && priceDkkStr !== null) {
        priceDkk = parseFloat(priceDkkStr);
      }
    } else {
      // Handle JSON (backward compatibility)
      const body = await request.json();
      name = body.name;
      type = body.type;
      priceDkk = body.priceDkk;
      description = body.description;
      imageUrl = body.imageUrl;
    }

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
      if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
        return NextResponse.json(
          { error: "Product type must be one of: earrings, cap, glooves, keyring" },
          { status: 400 }
        );
      }
      product.type = type as typeof VALID_TYPES[number];
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

    // Handle images - merge existing images with new uploads
    if (deleteImages) {
      product.images = [];
      product.imageUrl = undefined;
    } else {
      const validImageFiles = imageFiles.filter(file => file && file.size > 0);
      const allImages: string[] = [];
      
      // Start with existing images that should be kept
      if (existingImages.length > 0) {
        allImages.push(...existingImages);
      }
      
      // Add new images if any
      if (validImageFiles.length > 0) {
        // Validate new uploaded images only (not existing ones)
        const validation = validateImageFiles(validImageFiles);
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          );
        }

        // Convert new files to base64
        const newImages = await filesToBase64(validImageFiles);
        allImages.push(...newImages);
      }
      
      // Validate total image count
      const totalImageCount = allImages.length;
      if (totalImageCount > 0) {
        if (totalImageCount < 2 || totalImageCount > 4) {
          return NextResponse.json(
            { error: `Total images must be between 2 and 4. Currently: ${totalImageCount}` },
            { status: 400 }
          );
        }
        product.images = allImages;
        product.imageUrl = undefined; // Clear imageUrl when using images array
      } else if (imageUrl !== undefined && imageUrl !== null) {
        if (imageUrl.trim().length === 0) {
          // Empty string means clear images
          product.imageUrl = undefined;
          if (!product.images || product.images.length === 0) {
            return NextResponse.json(
              { error: "At least one image (URL or file) is required" },
              { status: 400 }
            );
          }
        } else {
          // Basic URL validation
          try {
            new URL(imageUrl.trim());
            product.imageUrl = imageUrl.trim();
            product.images = undefined; // Clear images array when using imageUrl
          } catch {
            return NextResponse.json(
              { error: "Image URL must be a valid URL" },
              { status: 400 }
            );
          }
        }
      } else if (existingImages.length === 0 && validImageFiles.length === 0) {
        // If no images are being sent and no deleteImages flag, keep existing images
        // Don't modify images array
      }
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
        images: product.images || [],
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



