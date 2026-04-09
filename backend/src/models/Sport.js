import mongoose from 'mongoose';

const sportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    icon: { type: String, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    // track whether a live admin is currently assigned to this sport
    adminAssigned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Sport', sportSchema);
