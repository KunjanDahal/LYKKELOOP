import mongoose, { Schema, Model } from "mongoose";

export type ProductType = "earrings" | "cap" | "glooves" | "keyring";

export interface IProduct {
  _id: string;
  name: string;
  type: ProductType;
  priceDkk: number;
  imageUrl: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Product type is required"],
      enum: {
        values: ["earrings", "cap", "glooves", "keyring"],
        message: "Product type must be one of: earrings, cap, glooves, keyring",
      },
    },
    priceDkk: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation during development
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;





