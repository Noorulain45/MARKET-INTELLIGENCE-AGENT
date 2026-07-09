import mongoose, { Document, Schema } from 'mongoose';

export type EventType = 'product_launch' | 'funding' | 'acquisition' | 'partnership' |
  'pricing_change' | 'hiring' | 'press_release' | 'website_change' | 'blog_post' | 'other';

export interface IMarketEvent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: EventType;
  competitorId?: mongoose.Types.ObjectId;
  competitorName?: string;
  source: string;
  sourceUrl?: string;
  date: Date;
  impact: 'high' | 'medium' | 'low';
  aiSummary?: string;
  tags: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarketEventSchema = new Schema<IMarketEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['product_launch', 'funding', 'acquisition', 'partnership',
        'pricing_change', 'hiring', 'press_release', 'website_change', 'blog_post', 'other'],
      required: true,
    },
    competitorId: { type: Schema.Types.ObjectId, ref: 'Competitor' },
    competitorName: String,
    source: { type: String, required: true },
    sourceUrl: String,
    date: { type: Date, required: true },
    impact: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    aiSummary: String,
    tags: [String],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MarketEventSchema.index({ competitorId: 1 });
MarketEventSchema.index({ type: 1 });
MarketEventSchema.index({ date: -1 });
MarketEventSchema.index({ impact: 1 });
MarketEventSchema.index({ title: 'text', description: 'text' });

export const MarketEvent = mongoose.model<IMarketEvent>('MarketEvent', MarketEventSchema);
