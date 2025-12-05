import mongoose, { Schema, Model } from "mongoose";

export interface IConversation {
  _id: string;
  userId: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  lastMessageSnippet: string;
  lastMessageAt: Date;
  userUnreadCount: number;
  adminUnreadCount: number;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    lastMessageSnippet: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    userUnreadCount: {
      type: Number,
      default: 0,
    },
    adminUnreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ConversationSchema.index({ userId: 1, updatedAt: -1 });

// Note: We ensure one conversation per user at the application level
// (see app/api/conversations/route.ts GET endpoint for admin)
// In the future, consider adding a unique index on userId after cleaning up duplicates:
// ConversationSchema.index({ userId: 1 }, { unique: true });

// Prevent re-compilation during development
const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;


