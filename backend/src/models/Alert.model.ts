import mongoose, { Document, Schema } from 'mongoose';

export type AlertType = 'competitor_activity' | 'funding' | 'price_change' | 'trend_spike' | 
  'negative_sentiment' | 'news' | 'product_launch' | 'custom';

export interface IAlert extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: AlertType;
  conditions: {
    competitors?: mongoose.Types.ObjectId[];
    keywords?: string[];
    categories?: string[];
    sentimentThreshold?: number;
    trendThreshold?: number;
  };
  channels: {
    email: boolean;
    inApp: boolean;
    slack: boolean;
  };
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: String,
    type: {
      type: String,
      enum: ['competitor_activity', 'funding', 'price_change', 'trend_spike',
        'negative_sentiment', 'news', 'product_launch', 'custom'],
      required: true,
    },
    conditions: {
      competitors: [{ type: Schema.Types.ObjectId, ref: 'Competitor' }],
      keywords: [String],
      categories: [String],
      sentimentThreshold: Number,
      trendThreshold: Number,
    },
    channels: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      slack: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
    lastTriggered: Date,
    triggerCount: { type: Number, default: 0 },
    frequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily', 'weekly'],
      default: 'daily',
    },
  },
  { timestamps: true }
);

AlertSchema.index({ userId: 1 });
AlertSchema.index({ type: 1 });
AlertSchema.index({ isActive: 1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
