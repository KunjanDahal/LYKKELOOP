import mongoose, { Schema, Model } from "mongoose";

export interface IPurchase {
  _id: string;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productName: string;
  productType: "earrings" | "cap" | "glooves" | "keyring";
  price: number;
  verificationStatus: "pending" | "received" | "not_received";
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      index: true,
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productType: {
      type: String,
      enum: ["earrings", "cap", "glooves", "keyring"],
      required: [true, "Product type is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "received", "not_received"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
PurchaseSchema.index({ userId: 1, createdAt: -1 });
PurchaseSchema.index({ verificationStatus: 1, createdAt: -1 });

// Prevent re-compilation during development
const Purchase: Model<IPurchase> =
  mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export default Purchase;
