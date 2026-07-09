import mongoose, { Document, Schema } from 'mongoose';

export interface ITrend extends Document {
  _id: mongoose.Types.ObjectId;
  keyword: string;
  category: string;
  source: 'google_trends' | 'github' | 'reddit' | 'news' | 'social';
  dataPoints: Array<{
    date: Date;
    value: number;
    volume?: number;
  }>;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  direction: 'rising' | 'falling' | 'stable';
  prediction?: {
    nextWeek: number;
    nextMonth: number;
    confidence: number;
  };
  relatedKeywords: string[];
  insights?: string;
  isEmergingTech: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrendSchema = new Schema<ITrend>(
  {
    keyword: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    source: {
      type: String,
      enum: ['google_trends', 'github', 'reddit', 'news', 'social'],
      required: true,
    },
    dataPoints: [{
      date: { type: Date, required: true },
      value: { type: Number, required: true },
      volume: Number,
    }],
    currentValue: { type: Number, default: 0 },
    previousValue: { type: Number, default: 0 },
    changePercent: { type: Number, default: 0 },
    direction: { type: String, enum: ['rising', 'falling', 'stable'], default: 'stable' },
    prediction: {
      nextWeek: Number,
      nextMonth: Number,
      confidence: Number,
    },
    relatedKeywords: [String],
    insights: String,
    isEmergingTech: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TrendSchema.index({ keyword: 1, source: 1 }, { unique: true });
TrendSchema.index({ direction: 1 });
TrendSchema.index({ category: 1 });
TrendSchema.index({ 'dataPoints.date': -1 });

export const Trend = mongoose.model<ITrend>('Trend', TrendSchema);
