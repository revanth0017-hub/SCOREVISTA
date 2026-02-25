import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    sportCategory: { type: String, required: true, trim: true, lowercase: true },
    adminCode: { type: String, required: true, unique: true, uppercase: true },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
);

adminSchema.index({ sportCategory: 1, isActive: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ adminCode: 1 });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('Admin', adminSchema);
