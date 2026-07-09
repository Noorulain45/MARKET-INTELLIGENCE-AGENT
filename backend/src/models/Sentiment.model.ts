import mongoose, { Document, Schema } from 'mongoose';

export interface ISentiment extends Document {
  _id: mongoose.Types.ObjectId;
  competitorId?: mongoose.Types.ObjectId;
  keyword: string;
  source: 'reddit' | 'product_hunt' | 'github' | 'reviews' | 'forums' | 'app_store';
  sourceUrl?: string;
  text: string;
  summary?: string;
  overallScore: number;
  label: 'positive' | 'negative' | 'neutral';
  topics: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  featureRequests: string[];
  complaints: string[];
  analyzedAt: Date;
  dataPoints: Array<{
    date: Date;
    score: number;
    volume: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SentimentSchema = new Schema<ISentiment>(
  {
    competitorId: { type: Schema.Types.ObjectId, ref: 'Competitor' },
    keyword: { type: String, required: true },
    source: {
      type: String,
      enum: ['reddit', 'product_hunt', 'github', 'reviews', 'forums', 'app_store'],
      required: true,
    },
    sourceUrl: String,
    text: { type: String, required: true },
    summary: String,
    overallScore: { type: Number, min: -1, max: 1, default: 0 },
    label: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
    topics: {
      positive: [String],
      negative: [String],
      neutral: [String],
    },
    featureRequests: [String],
    complaints: [String],
    analyzedAt: { type: Date, default: Date.now },
    dataPoints: [{
      date: Date,
      score: Number,
      volume: Number,
    }],
  },
  { timestamps: true }
);

SentimentSchema.index({ competitorId: 1 });
SentimentSchema.index({ keyword: 1 });
SentimentSchema.index({ label: 1 });
SentimentSchema.index({ analyzedAt: -1 });

export const Sentiment = mongoose.model<ISentiment>('Sentiment', SentimentSchema);
