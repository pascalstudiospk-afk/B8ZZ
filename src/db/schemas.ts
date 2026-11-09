/**
 * Database Schemas for NyxVault Exclusive Media Platform
 * Contains complete production-ready definitions for both:
 * 1. MongoDB (Mongoose Schemas)
 * 2. PostgreSQL (SQL DDL Scripts with Indexes & Foreign Keys)
 */

export const MONGOOSE_SCHEMAS_CODE = `
// ==========================================
// MONGODB / MONGOOSE SCHEMAS (models/*.js)
// ==========================================
const mongoose = require('mongoose');
const { Schema } = mongoose;

// 1. Category Schema (CMS Managed)
const CategorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  description: { type: String },
  icon: { type: String, default: 'Film' },
  count: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// 2. User & Subscriber Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'creator', 'admin'], default: 'user' },
  avatar: { type: String },
  subscription: {
    active: { type: Boolean, default: false },
    planName: { type: String },
    expiresAt: { type: Date }
  },
  unlockedMedia: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
  watchlist: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
  watchHistory: [{
    mediaId: { type: Schema.Types.ObjectId, ref: 'Media' },
    watchedAt: { type: Date, default: Date.now },
    progressSeconds: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  }],
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// 3. Media Item Schema (Streaming Optimized)
const MediaSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: { type: String },
  type: { type: String, enum: ['video', 'image'], required: true },
  access: { type: String, enum: ['free', 'exclusive'], default: 'free', index: true },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'EUR' },
  category: { type: String, required: true, index: true },
  categories: [{ type: String, index: true }],
  tags: [{ type: String, index: true }],
  thumbnailUrl: { type: String, required: true },
  mediaUrl: { type: String, required: true },
  previewVideoUrl: { type: String }, // 10-15s silent teaser loop for card hover
  duration: { type: String },
  resolution: { type: String, default: '4K UHD' },
  author: {
    name: { type: String, required: true },
    avatar: { type: String },
    verified: { type: Boolean, default: false }
  },
  viewsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  unlockedCount: { type: Number, default: 0 },
  exclusivePerks: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// 4. Nyole Transaction & Subscription Order Schema
const NyoleTransactionSchema = new Schema({
  transactionRef: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userEmail: { type: String, required: true },
  mediaId: { type: Schema.Types.ObjectId, ref: 'Media', index: true },
  type: { type: String, enum: ['single_media', 'subscription'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending', index: true },
  paymentMethod: { type: String, enum: ['nyole_pay', 'credit_card', 'mobile_money', 'crypto'], default: 'nyole_pay' },
  nyoleTransactionId: { type: String, index: true },
  webhookPayload: { type: Schema.Types.Mixed },
  webhookReceivedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// 5. Monetization & Ad Network Configuration Schema
const MonetizationConfigSchema = new Schema({
  key: { type: String, default: 'global_config', unique: true },
  nyoleConfig: {
    merchantId: { type: String },
    apiKey: { type: String },
    webhookSecret: { type: String },
    environment: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
    callbackUrl: { type: String },
    webhookUrl: { type: String },
    autoUnlockOnWebhook: { type: Boolean, default: true }
  },
  clickMonetization: {
    enabled: { type: Boolean, default: true },
    mode: { type: String, enum: ['popunder', 'interstitial_redirect', 'direct_link'], default: 'popunder' },
    targetUrl: { type: String },
    triggerDelaySeconds: { type: Number, default: 3 },
    dailyFrequencyCap: { type: Number, default: 2 },
    estimatedCpc: { type: Number, default: 0.05 },
    totalClicksTriggered: { type: Number, default: 0 }
  },
  adBanners: [{
    id: String,
    name: String,
    position: String,
    enabled: Boolean,
    type: String,
    imageUrl: String,
    targetUrl: String,
    customScriptCode: String,
    cpmRate: Number,
    cpcRate: Number,
    impressions: Number,
    clicks: Number
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = {
  Category: mongoose.model('Category', CategorySchema),
  User: mongoose.model('User', UserSchema),
  Media: mongoose.model('Media', MediaSchema),
  NyoleTransaction: mongoose.model('NyoleTransaction', NyoleTransactionSchema),
  MonetizationConfig: mongoose.model('MonetizationConfig', MonetizationConfigSchema)
};
`;

export const POSTGRESQL_DDL_CODE = `
-- ========================================================
-- POSTGRESQL RELATIONAL DDL (PostgreSQL 14+)
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Film',
    media_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- 2. Table: Users & Subscribers
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
    avatar_url TEXT,
    subscription_active BOOLEAN DEFAULT FALSE,
    subscription_plan VARCHAR(100),
    subscription_expires_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_subscription ON users(subscription_active);

-- 3. Table: Media Catalog (Streaming Videos & Media)
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('video', 'image')),
    access_type VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (access_type IN ('free', 'exclusive')),
    price DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'EUR',
    category VARCHAR(100) NOT NULL,
    categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    thumbnail_url TEXT NOT NULL,
    media_url TEXT NOT NULL,
    preview_video_url TEXT,
    duration VARCHAR(50),
    resolution VARCHAR(50) DEFAULT '4K UHD',
    author_name VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    author_verified BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    unlocked_count INTEGER DEFAULT 0,
    exclusive_perks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_access ON media(access_type);
CREATE INDEX idx_media_category ON media(category);
CREATE INDEX idx_media_created ON media(created_at DESC);

-- 4. Table: Watch History (Resume & Track Progress)
CREATE TABLE watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    progress_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    watched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, media_id)
);

CREATE INDEX idx_history_user ON watch_history(user_id);
CREATE INDEX idx_history_watched ON watch_history(watched_at DESC);

-- 5. Table: Watchlist (Saved Videos)
CREATE TABLE user_watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, media_id)
);

CREATE INDEX idx_watchlist_user ON user_watchlist(user_id);

-- 6. Table: User Unlocked Media (Direct Media Access)
CREATE TABLE user_unlocked_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, media_id)
);

CREATE INDEX idx_user_unlocked_user ON user_unlocked_media(user_id);
CREATE INDEX idx_user_unlocked_media ON user_unlocked_media(media_id);

-- 7. Table: Nyole Transactions & Payments
CREATE TABLE nyole_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_ref VARCHAR(100) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    user_email VARCHAR(255) NOT NULL,
    media_id UUID REFERENCES media(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('single_media', 'subscription')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'nyole_pay' CHECK (payment_method IN ('nyole_pay', 'credit_card', 'mobile_money', 'crypto')),
    nyole_transaction_id VARCHAR(255),
    webhook_payload JSONB,
    webhook_received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nyole_tx_ref ON nyole_transactions(transaction_ref);
CREATE INDEX idx_nyole_tx_user ON nyole_transactions(user_id);
CREATE INDEX idx_nyole_tx_status ON nyole_transactions(payment_status);

-- 8. Table: Ad Banner Performance & Impressions
CREATE TABLE ad_banners (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    ad_type VARCHAR(50) DEFAULT 'native_ad',
    image_url TEXT,
    target_url TEXT,
    custom_script_code TEXT,
    cpm_rate DECIMAL(8, 4) DEFAULT 1.50,
    cpc_rate DECIMAL(8, 4) DEFAULT 0.25,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Table: Click Monetization Events
CREATE TABLE click_monetization_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_hash VARCHAR(64),
    mode VARCHAR(50) NOT NULL,
    target_url TEXT NOT NULL,
    estimated_revenue DECIMAL(8, 4) DEFAULT 0.05,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_click_events_created ON click_monetization_events(created_at);
`;
