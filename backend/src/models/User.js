import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const locationSchema = new mongoose.Schema(
  {
    city: String,
    state: String,
    country: String,
    address: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    profileImage: String,
    location: locationSchema,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isBanned: { type: Boolean, default: false },
    online: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.index({ 'location.coordinates': '2dsphere' });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
