const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String },
  referer: { type: String, default: 'Direct' },
  browser: { type: String },
  os: { type: String },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'], default: 'unknown' },
  country: { type: String, default: 'Unknown' },
  city: { type: String, default: 'Unknown' },
}, { _id: false });

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: [/^[a-zA-Z0-9_-]+$/, 'Short code can only contain letters, numbers, hyphens, and underscores'],
  },
  customAlias: {
    type: String,
    trim: true,
    sparse: true,
    default: null,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  password: {
    type: String,
    default: null,
  },
  clickLimit: {
    type: Number,
    default: null,
  },
  clicks: [clickSchema],
  totalClicks: {
    type: Number,
    default: 0,
  },
  uniqueClicks: {
    type: Number,
    default: 0,
  },
  uniqueIPs: {
    type: [String],
    default: [],
    select: false,
  },
  tags: [{ type: String, trim: true }],
  utmSource: { type: String },
  utmMedium: { type: String },
  utmCampaign: { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: short URL
urlSchema.virtual('shortUrl').get(function () {
  return `${process.env.BASE_URL}/${this.shortCode}`;
});

// Virtual: isExpired
urlSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual: isClickLimitReached
urlSchema.virtual('isClickLimitReached').get(function () {
  if (!this.clickLimit) return false;
  return this.totalClicks >= this.clickLimit;
});

// Indexes
urlSchema.index({ shortCode: 1 });
urlSchema.index({ owner: 1 });
urlSchema.index({ createdAt: -1 });
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $ne: null } } });

module.exports = mongoose.model('Url', urlSchema);
