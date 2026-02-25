import mongoose from 'mongoose';

const highlightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sport: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    videoUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, trim: true },
    duration: { type: String, trim: true },
    views: { type: Number, default: 0 },
    date: { type: String, trim: true },
  },
  { timestamps: true }
);

highlightSchema.index({ sport: 1 });

export default mongoose.model('Highlight', highlightSchema);
