import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: 'weekly' | 'monthly' | 'custom' | 'competitor' | 'market';
  generatedBy: mongoose.Types.ObjectId;
  content: {
    executiveSummary: string;
    competitorAnalysis?: string;
    marketTrends?: string;
    customerSentiment?: string;
    opportunities?: string;
    risks?: string;
    strategicRecommendations?: string;
    aiInsights?: string;
    references?: string[];
  };
  data: {
    competitors?: mongoose.Types.ObjectId[];
    dateRange: { from: Date; to: Date };
    metrics?: Record<string, unknown>;
  };
  pdfUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['weekly', 'monthly', 'custom', 'competitor', 'market'],
      required: true,
    },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: {
      executiveSummary: String,
      competitorAnalysis: String,
      marketTrends: String,
      customerSentiment: String,
      opportunities: String,
      risks: String,
      strategicRecommendations: String,
      aiInsights: String,
      references: [String],
    },
    data: {
      competitors: [{ type: Schema.Types.ObjectId, ref: 'Competitor' }],
      dateRange: {
        from: { type: Date, required: true },
        to: { type: Date, required: true },
      },
      metrics: Schema.Types.Mixed,
    },
    pdfUrl: String,
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
    },
  },
  { timestamps: true }
);

ReportSchema.index({ generatedBy: 1 });
ReportSchema.index({ type: 1 });
ReportSchema.index({ createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
