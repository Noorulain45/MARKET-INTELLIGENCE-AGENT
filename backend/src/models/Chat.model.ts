import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; url: string; type: string }>;
  metadata?: Record<string, unknown>;
}

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  context?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Conversation' },
    messages: [{
      role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      sources: [{
        title: String,
        url: String,
        type: String,
      }],
      metadata: Schema.Types.Mixed,
    }],
    context: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ChatSchema.index({ userId: 1 });
ChatSchema.index({ createdAt: -1 });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
