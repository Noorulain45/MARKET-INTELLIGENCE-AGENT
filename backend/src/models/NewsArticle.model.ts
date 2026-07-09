import mongoose, { Document, Schema } from 'mongoose';

export type NewsCategory =
  | 'AI' | 'Technology' | 'Business' | 'Finance' | 'Product Launches'
  | 'Startups' | 'Funding' | 'Acquisitions' | 'Marketing' | 'Cybersecurity' | 'Other';

export interface INewsArticle extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  summary?: string;
  url: string;
  source: string;
  author?: string;
  publishedAt: Date;
  imageUrl?: string;
  category: NewsCategory;
  tags: string[];
  competitors: mongoose.Types.ObjectId[];
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  importance: 'high' | 'medium' | 'low';
  isProcessed: boolean;
  embedding?: number[];
  readCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const NewsArticleSchema = new Schema<INewsArticle>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    summary: { type: String },
    url: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    author: String,
    publishedAt: { type: Date, required: true },
    imageUrl: String,
    category: {
      type: String,
      enum: ['AI', 'Technology', 'Business', 'Finance', 'Product Launches',
        'Startups', 'Funding', 'Acquisitions', 'Marketing', 'Cybersecurity', 'Other'],
      default: 'Other',
    },
    tags: [String],
    competitors: [{ type: Schema.Types.ObjectId, ref: 'Competitor' }],
    sentiment: {
      score: Number,
      label: { type: String, enum: ['positive', 'negative', 'neutral'] },
    },
    importance: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    isProcessed: { type: Boolean, default: false },
    embedding: [Number],
    readCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

NewsArticleSchema.index({ title: 'text', content: 'text', summary: 'text' });
NewsArticleSchema.index({ publishedAt: -1 });
NewsArticleSchema.index({ category: 1 });
NewsArticleSchema.index({ source: 1 });
NewsArticleSchema.index({ competitors: 1 });
NewsArticleSchema.index({ 'sentiment.label': 1 });

export const NewsArticle = mongoose.model<INewsArticle>('NewsArticle', NewsArticleSchema);
