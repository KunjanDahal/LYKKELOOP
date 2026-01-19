import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  email?: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    // Email/password are optional to support name-only login accounts.
    // When provided, email is unique via a sparse index (multiple null/undefined allowed).
    email: {
      type: String,
      required: false,
      unique: false, // don't use unique here; we create a sparse unique index manually
      sparse: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: any) {
          // Allow missing/empty email for name-only users
          if (v === null || v === undefined || v === "") return true;
          if (typeof v !== "string") return false;
          const trimmed = v.trim();
          if (trimmed.length === 0) return true;
          return /^\S+@\S+\.\S+$/.test(trimmed);
        },
        message: "Please provide a valid email",
      },
    },
    passwordHash: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in dev/hot-reload
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);

// Allows multiple null emails but enforces uniqueness for real emails.
export async function fixEmailIndex() {
  try {
    const collection = User.collection;

    // Get all indexes
    const indexes = await collection.indexes();

    // Drop non-sparse/legacy email indexes
    for (const index of indexes) {
      if (index.key && (index.key as any).email && (!index.sparse || index.name === "email_1")) {
        if (!index.name) continue;
        try {
          await collection.dropIndex(index.name);
          console.log(`✅ Dropped non-sparse email index: ${index.name}`);
        } catch (err: any) {
          if (err.code !== 27) {
            console.log(`Note: Could not drop index ${index.name}:`, err.message);
          }
        }
      }
    }

    // Create sparse unique index on email
    try {
      await collection.createIndex(
        { email: 1 },
        {
          unique: true,
          sparse: true,
          name: "email_1_sparse",
        }
      );
      console.log("✅ Created sparse unique index on email");
    } catch (err: any) {
      // Ignore index already exists / conflicts
      if (err.code !== 85 && err.code !== 86) {
        console.log("Note: Could not create email index:", err.message);
      }
    }
  } catch (err) {
    console.error("Error fixing email index:", err);
  }
}

export default User;
export { UserSchema };



