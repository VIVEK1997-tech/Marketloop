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
    phone: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    roles: {
      type: [{ type: String, enum: ['buyer', 'seller', 'admin'] }],
      default: ['buyer'],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one role is required'
      }
    },
    activeRole: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    profileImage: String,
    location: locationSchema,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isVerified: { type: Boolean, default: false, index: true },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
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

userSchema.pre('validate', function syncRoles(next) {
  const fallbackRole = this.role || 'buyer';

  if (!Array.isArray(this.roles) || !this.roles.length) {
    this.roles = [fallbackRole];
  }

  if (!this.activeRole || !this.roles.includes(this.activeRole)) {
    this.activeRole = this.roles.includes('buyer') ? 'buyer' : this.roles[0];
  }

  this.role = this.activeRole;
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
