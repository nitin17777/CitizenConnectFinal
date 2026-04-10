const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['citizen', 'worker', 'admin'],
      default: 'citizen',
    },

    // ── Profile ─────────────────────────────────────────────────────────────
    phone:   { type: String, default: '' },
    city:    { type: String, default: '' },
    address: { type: String, default: '' },
    isActive: { type: Boolean, default: true },

    // ── Worker-specific ─────────────────────────────────────────────────────
    specialization: {
      type: String,
      enum: ['road_worker', 'sanitation_worker', 'electrical_worker', 'general_worker'],
      default: 'general_worker',
    },
    workerEarnings:    { type: Number, default: 0 },
    completedJobsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
