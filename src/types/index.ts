export type MediaType = 'image' | 'video';
export type AccessType = 'free' | 'exclusive';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  popular?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  count?: number;
}

export interface WatchHistoryItem {
  videoId: string;
  watchedAt: string;
  progressSeconds?: number;
  durationSeconds?: number;
  completed?: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: MediaType;
  access: AccessType;
  price?: number;
  currency: string;
  category: string;
  categories?: string[];
  tags: string[];
  thumbnailUrl: string;
  mediaUrl: string;
  previewVideoUrl?: string; // Short looping teaser for card hover preview
  duration?: string;
  resolution: string; // e.g. "4K UHD", "8K RAW", "1080p 60fps"
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  viewsCount: number;
  likesCount: number;
  unlockedCount: number;
  createdAt: string;
  exclusivePerks?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'creator';
  token?: string;
  avatar?: string;
  createdAt?: string;
  subscription?: {
    active: boolean;
    planName: string;
    expiresAt: string;
  };
  unlockedMediaIds: string[];
  watchlist?: string[]; // array of video IDs
  watchHistory?: WatchHistoryItem[];
}

export interface NyoleTransaction {
  id: string;
  transactionRef: string;
  userId: string;
  userEmail: string;
  mediaId?: string;
  mediaTitle?: string;
  type: 'single_media' | 'subscription';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'nyole_pay' | 'credit_card' | 'mobile_money' | 'crypto';
  nyoleTransactionId: string;
  webhookReceivedAt?: string;
  createdAt: string;
}

export interface AdBannerConfig {
  id: string;
  name: string;
  position: 'header_top' | 'feed_interstitial' | 'sidebar' | 'footer_sticky';
  enabled: boolean;
  type: 'custom_html' | 'native_ad' | 'script';
  title?: string;
  sponsorName?: string;
  imageUrl?: string;
  targetUrl: string;
  customScriptCode?: string;
  cpmRate: number;
  cpcRate: number;
  impressions: number;
  clicks: number;
}

export interface ClickMonetizationConfig {
  enabled: boolean;
  mode: 'popunder' | 'interstitial_redirect' | 'direct_link';
  targetUrl: string;
  triggerDelaySeconds: number;
  triggerAfterMediaClicks: number;
  dailyFrequencyCap: number;
  estimatedCpc: number;
  totalClicksTriggered: number;
  totalEarningsEstimated: number;
}

export interface NyoleApiConfig {
  merchantId: string;
  apiKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  callbackUrl: string;
  webhookUrl: string;
  autoUnlockOnWebhook: boolean;
}

export interface MonetizationSettings {
  nyole: NyoleApiConfig;
  clickMonetization: ClickMonetizationConfig;
  adBanners: AdBannerConfig[];
}

export interface AnalyticsStats {
  totalRevenue: number;
  nyoleRevenue: number;
  nyoleMediaSalesCount: number;
  nyoleSubscriptionsCount: number;
  activeSubscribers: number;
  totalSubscribersRegistered: number;
  adEarnings: number;
  totalAdClicks: number;
  totalVisits: number;
  totalVideoViews: number;
  conversionRate: number;
  revenueByDay: { date: string; amount: number; count: number }[];
  recentTransactions: NyoleTransaction[];
  topVideos: { id: string; title: string; views: number; likes: number; category: string }[];
}

export interface HeroPageContent {
  badge: string;
  badgeExtra: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  securityNote1: string;
  securityNote2: string;
  heroImageUrl: string;
  showcaseBadge: string;
  showcaseTitle: string;
  showcaseSubtitle: string;
  statsKpis: {
    views: string;
    viewsLabel: string;
    masters: string;
    mastersLabel: string;
    subscribers: string;
    subscribersLabel: string;
    uptime: string;
    uptimeLabel: string;
  };
}

export interface VipPageContent {
  headerBadge: string;
  title: string;
  monthlyPrice: number;
  monthlyPeriodText: string;
  yearlyPrice: number;
  yearlyPeriodText: string;
  yearlyDiscountBadge: string;
  summaryNotice: string;
  perks: string[];
  ctaButtonText: string;
  guaranteeText: string;
}

export interface LibraryPageContent {
  title: string;
  activePassBadge: string;
  freePassBadge: string;
  emptyWatchlistTitle: string;
  emptyWatchlistText: string;
  emptyHistoryTitle: string;
  emptyHistoryText: string;
  emptyUnlockedTitle: string;
  emptyUnlockedText: string;
}

export interface MediaModalPageContent {
  paywallTitle: string;
  paywallDescription: string;
  paywallCtaText: string;
  paywallSecondaryCta: string;
  securityNotice: string;
  downloadLockedNotice: string;
  downloadUnlockedNotice: string;
}

export interface AuthPageContent {
  brandBadge: string;
  loginTitle: string;
  registerTitle: string;
  loginButtonText: string;
  registerButtonText: string;
  demoAccountsTitle: string;
}

export interface GeneralSiteContent {
  siteName: string;
  siteTagline: string;
  announcementBanner: {
    enabled: boolean;
    text: string;
    linkText?: string;
  };
  footerDescription: string;
  copyrightText: string;
  supportContact: string;
}

export interface SitePagesContent {
  general: GeneralSiteContent;
  hero: HeroPageContent;
  vip: VipPageContent;
  library: LibraryPageContent;
  mediaModal: MediaModalPageContent;
  auth: AuthPageContent;
}
