import mongoose, { Document, Schema } from 'mongoose';

export interface IWatchlist extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  competitors: mongoose.Types.ObjectId[];
  keywords: string[];
  industries: string[];
  isShared: boolean;
  sharedWith: mongoose.Types.ObjectId[];
  alertConfig?: {
    enabled: boolean;
    frequency: 'realtime' | 'daily' | 'weekly';
  };
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    competitors: [{ type: Schema.Types.ObjectId, ref: 'Competitor' }],
    keywords: [String],
    industries: [String],
    isShared: { type: Boolean, default: false },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    alertConfig: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['realtime', 'daily', 'weekly'], default: 'daily' },
    },
  },
  { timestamps: true }
);

WatchlistSchema.index({ userId: 1 });
WatchlistSchema.index({ name: 'text' });

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);
