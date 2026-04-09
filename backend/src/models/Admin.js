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
// email and adminCode are marked unique in the schema above, which creates indexes automatically.
// avoid explicit duplicate indexes to prevent mongoose warnings.
// adminSchema.index({ email: 1 });
// adminSchema.index({ adminCode: 1 });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

// remove any legacy index on "code" that could cause every insert to fail
// (older versions of the schema created this index accidentally). Doing it here
// means developers don't have to manually drop it when spinning up a fresh
// database.
const Admin = mongoose.model('Admin', adminSchema);

// attempt to drop the obsolete index; ignore errors if it doesn't exist
Admin.collection.dropIndex('code_1').catch((err) => {
  // Mongo returns NamespaceNotFound if collection doesn't exist yet or
  // IndexNotFound if index is missing; both can be safely ignored.
  if (err.code && err.code !== 27 && err.code !== 26) {
    console.warn('Unexpected error dropping code index:', err);
  }
});

export default Admin;
