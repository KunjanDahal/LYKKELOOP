import mongoose, { Schema, Model } from "mongoose";

export type ProductType = "earrings" | "cap" | "glooves" | "keyring";

export interface IProduct {
  _id: string;
  name: string;
  type: ProductType;
  priceDkk: number;
  imageUrl?: string;
  images?: string[]; // Base64 encoded images
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
      required: false,
      trim: true,
    },
    images: {
      type: [String],
      required: false,
      default: [],
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

// Custom validator: ensure at least one of imageUrl or images is provided
ProductSchema.pre('validate', function(next) {
  if (!this.imageUrl && (!this.images || this.images.length === 0)) {
    next(new Error('Either imageUrl or images array must be provided'));
  } else {
    next();
  }
});

// Prevent re-compilation during development
// Use existing model if available, otherwise create new one
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;





