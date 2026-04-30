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

const pushTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, trim: true },
    platform: { type: String, enum: ['android', 'ios', 'web'], default: 'android' },
    deviceName: { type: String, trim: true, default: '' },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const appNotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: '' },
    type: { type: String, enum: ['info', 'success', 'warning', 'danger'], default: 'info' },
    module: { type: String, trim: true, default: '' },
    linkedRecordId: { type: String, trim: true, default: '' },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 }
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
    cart: { type: [cartItemSchema], default: [] },
    pushTokens: { type: [pushTokenSchema], default: [] },
    appNotifications: { type: [appNotificationSchema], default: [] },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false, index: true },
    accountStatus: {
      type: String,
      enum: ['active', 'deactivated', 'kyc_pending', 'inactive'],
      default: 'active',
      index: true
    },
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

  if (!this.accountStatus) {
    this.accountStatus = 'active';
  }
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
