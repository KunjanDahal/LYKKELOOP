import mongoose, { Schema, Model } from "mongoose";

export interface IMessage {
  _id: string;
  conversationId: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId | null;
  senderRole: "user" | "admin";
  content: string;
  createdAt: Date;
  readAt: Date | null;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation ID is required"],
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    senderRole: {
      type: String,
      enum: ["user", "admin"],
      required: [true, "Sender role is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [5000, "Message content cannot exceed 5000 characters"],
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// Prevent re-compilation during development
const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;


