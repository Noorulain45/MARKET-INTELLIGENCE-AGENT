import mongoose, { Document, Schema } from 'mongoose';

export interface ICompetitor extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  website: string;
  description?: string;
  industry: string;
  logo?: string;
  tags: string[];
  addedBy: mongoose.Types.ObjectId;
  watchlists: mongoose.Types.ObjectId[];
  metrics: {
    employees?: number;
    funding?: number;
    founded?: number;
    headquarters?: string;
    techStack?: string[];
    socialMedia?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  lastActivity?: Date;
  activityCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitorSchema = new Schema<ICompetitor>(
  {
    name: { type: String, required: true, trim: true },
    website: { type: String, required: true, trim: true },
    description: { type: String },
    industry: { type: String, required: true },
    logo: { type: String },
    tags: [{ type: String }],
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    watchlists: [{ type: Schema.Types.ObjectId, ref: 'Watchlist' }],
    metrics: {
      employees: Number,
      funding: Number,
      founded: Number,
      headquarters: String,
      techStack: [String],
      socialMedia: {
        twitter: String,
        linkedin: String,
        github: String,
      },
    },
    lastActivity: Date,
    activityCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CompetitorSchema.index({ name: 'text', description: 'text' });
CompetitorSchema.index({ industry: 1 });
CompetitorSchema.index({ addedBy: 1 });

export const Competitor = mongoose.model<ICompetitor>('Competitor', CompetitorSchema);
