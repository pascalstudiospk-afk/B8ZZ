import React, { useState, useEffect } from 'react';
import { CategoryItem, MediaItem, MonetizationSettings, User, SitePagesContent } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MediaGrid } from './components/MediaGrid';
import { MediaModal } from './components/MediaModal';
import { NyoleCheckoutModal } from './components/NyoleCheckoutModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { UserLibraryView } from './components/UserLibraryView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdBanner } from './components/AdBanner';
import { AuthModal } from './components/AuthModal';
import { ExternalLink, Smartphone, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { BuzzLeaksLogo } from './components/BuzzLeaksLogo';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'gallery' | 'library' | 'subscriptions' | 'admin'>('gallery');
  const [historyStack, setHistoryStack] = useState<('gallery' | 'library' | 'subscriptions' | 'admin')[]>(['gallery']);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [monetization, setMonetization] = useState<MonetizationSettings | null>(null);
  const [siteContent, setSiteContent] = useState<SitePagesContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [checkoutState, setCheckoutState] = useState<{
    open: boolean;
    item?: MediaItem | null;
    planName?: string | null;
    planPrice?: number;
  }>({ open: false });
  const [subscriptionOpen, setSubscriptionOpen] = useState<boolean>(false);
  const [authOpen, setAuthOpen] = useState<boolean>(false);

  // Popunder / click monetization counter
  const [clickCount, setClickCount] = useState<number>(0);

  // Initial Data Fetch
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      // Auto login as default demo user for instant prototype exploration
      const authRes = await api.login('pascalstudios.PK@gmail.com');
      setCurrentUser(authRes.user);

      const [mediaRes, catRes, monRes, siteRes] = await Promise.all([
        api.getMedia(),
        api.getCategories(),
        api.getMonetizationSettings(),
        api.getSiteContent()
      ]);
      setMediaList(mediaRes.media);
      setCategories(catRes.categories);
      setMonetization(monRes.settings);
      if (siteRes?.content) {
        setSiteContent(siteRes.content);
      }
    } catch (e) {
      console.error('Failed to initialize app:', e);
    } finally {
      setLoading(false);
    }
  };

  const reloadMedia = async () => {
    try {
      const [mediaRes, catRes] = await Promise.all([
        api.getMedia(),
        api.getCategories()
      ]);
      setMediaList(mediaRes.media);
      setCategories(catRes.categories);
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle user role between Admin & Standard user for rapid testing
  const handleToggleRole = () => {
    if (!currentUser) return;
    const newRole = currentUser.role === 'admin' ? 'user' : 'admin';
    const updated = { ...currentUser, role: newRole as any };
    setCurrentUser(updated);
  };

  // Toggle subscription state for rapid testing of locked vs unlocked exclusive media
  const handleToggleSubscription = async () => {
    try {
      const res = await api.toggleSubscription();
      if (currentUser) {
        setCurrentUser({ ...currentUser, subscription: res.subscription });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle watchlist
  const handleToggleWatchlist = async (item: MediaItem) => {
    try {
      const res = await api.toggleWatchlist(item.id);
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          watchlist: res.watchlist
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Click Monetization Trigger
  const handleMediaClickTracking = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (
      monetization?.clickMonetization.enabled &&
      nextCount % (monetization.clickMonetization.triggerAfterMediaClicks || 2) === 0
    ) {
      api.recordMonetizationClick({ isPopunder: true }).then((res) => {
        if (res.redirectUrl && monetization.clickMonetization.mode === 'direct_link') {
          window.open(res.redirectUrl, '_blank', 'noopener,noreferrer');
        }
      }).catch(() => {});
    }
  };

  // Video click -> open lightbox & player
  const handleSelectMedia = (item: MediaItem) => {
    handleMediaClickTracking();
    setSelectedMedia(item);
    api.recordView(item.id);
  };

  // Direct subscription trigger from card or modal for exclusive content
  const handleOpenUnlock = (item: MediaItem) => {
    setSelectedMedia(null);
    setSubscriptionOpen(true);
  };

  // Subscription Plan selected
  const handleSelectSubscriptionPlan = (planName: string, price: number) => {
    setSubscriptionOpen(false);
    setCheckoutState({
      open: true,
      planName,
      planPrice: price
    });
  };

  // Successful payment confirmation via Nyole webhook
  const handlePaymentSuccess = async (unlockedMediaId?: string) => {
    setCheckoutState({ open: false });

    // Refresh user state
    try {
      const meRes = await api.getMe();
      setCurrentUser(meRes.user);
      await reloadMedia();
    } catch (e) {
      console.error(e);
    }

    // Reopen media modal if open
    if (unlockedMediaId) {
      const updatedItem = mediaList.find(m => m.id === unlockedMediaId);
      if (updatedItem) {
        setSelectedMedia(updatedItem);
      }
    }
  };

  // Tab navigation with history tracking
  const handleSelectTab = (tab: 'gallery' | 'library' | 'subscriptions' | 'admin') => {
    if (tab === currentTab) return;
    setHistoryStack(prev => [...prev, tab]);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global Back Page Navigation Handler
  const handleGoBack = () => {
    if (checkoutState.open) {
      setCheckoutState({ open: false });
      return;
    }
    if (subscriptionOpen) {
      setSubscriptionOpen(false);
      return;
    }
    if (authOpen) {
      setAuthOpen(false);
      return;
    }
    if (selectedMedia) {
      setSelectedMedia(null);
      return;
    }

    if (historyStack.length > 1) {
      const updated = [...historyStack];
      updated.pop(); // remove active tab
      const previous = updated[updated.length - 1];
      setHistoryStack(updated);
      setCurrentTab(previous);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentTab !== 'gallery') {
      setCurrentTab('gallery');
      setHistoryStack(['gallery']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Global Home Page Navigation Handler
  const handleGoHome = () => {
    setSelectedMedia(null);
    setCheckoutState({ open: false });
    setSubscriptionOpen(false);
    setAuthOpen(false);
    setCurrentTab('gallery');
    setHistoryStack(['gallery']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canGoBack = Boolean(
    currentTab !== 'gallery' ||
    selectedMedia ||
    subscriptionOpen ||
    checkoutState.open ||
    authOpen ||
    historyStack.length > 1
  );

  const headerBanner = monetization?.adBanners.find(b => b.position === 'header_top' && b.enabled);
  const isSubscribed = Boolean(currentUser?.subscription?.active);
  const unlockedMediaIds = currentUser?.unlockedMediaIds || [];
  const watchlistIds = currentUser?.watchlist || [];

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-100 selection:bg-[#FF0033] selection:text-white font-sans">
      {/* Global Top Announcement Banner */}
      {siteContent?.general?.announcementBanner?.enabled && (
        <aside aria-label="Annonce du site" className="bg-gradient-to-r from-[#FF0033] via-[#FF2A1A] to-[#FF4500] py-2 px-4 text-center text-xs font-semibold text-white flex items-center justify-center gap-3 shadow-md z-40">
          <span className="truncate max-w-xl">{siteContent.general.announcementBanner.text}</span>
          {siteContent.general.announcementBanner.linkText && (
            <button
              onClick={() => setSubscriptionOpen(true)}
              className="underline hover:text-black font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
            >
              <span>{siteContent.general.announcementBanner.linkText}</span>
              <span>&rarr;</span>
            </button>
          )}
        </aside>
      )}

      {/* Top Navigation with Back Page & Home Support */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onOpenAuth={() => setAuthOpen(true)}
        onToggleRole={handleToggleRole}
        onToggleSubscription={handleToggleSubscription}
        onOpenSubscriptions={() => setSubscriptionOpen(true)}
        canGoBack={canGoBack}
        onGoBack={handleGoBack}
      />

      {/* Strategic Header Top Ad Banner */}
      {!isSubscribed && headerBanner && (
        <AdBanner banner={headerBanner} positionName="Header Leaderboard (728x90)" />
      )}

      {/* Main Content Areas */}
      <main className="flex-1">
        {currentTab === 'gallery' && (
          <>
            <HeroSection
              content={siteContent?.hero}
              onExploreClick={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onVipClick={() => setSubscriptionOpen(true)}
            />

            <div id="catalog-section">
              <MediaGrid
                media={mediaList}
                categories={categories}
                unlockedMediaIds={unlockedMediaIds}
                watchlistIds={watchlistIds}
                isSubscribed={isSubscribed}
                adBanners={monetization?.adBanners || []}
                onSelectMedia={handleSelectMedia}
                onQuickUnlock={handleOpenUnlock}
                onToggleWatchlist={handleToggleWatchlist}
              />
            </div>
          </>
        )}

        {currentTab === 'library' && (
          <UserLibraryView
            currentUser={currentUser}
            content={siteContent?.library}
            onSelectMedia={handleSelectMedia}
            onExploreCatalog={() => handleSelectTab('gallery')}
            onOpenVip={() => setSubscriptionOpen(true)}
            onToggleWatchlist={handleToggleWatchlist}
            onGoBack={handleGoBack}
            onGoHome={handleGoHome}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            onMediaUpdated={reloadMedia}
            onGoBack={handleGoBack}
            onGoHome={handleGoHome}
            siteContent={siteContent}
            onSiteContentUpdated={(newContent) => setSiteContent(newContent)}
          />
        )}
      </main>

      {/* Lightbox & Streaming Player Modal */}
      {selectedMedia && (
        <MediaModal
          item={selectedMedia}
          content={siteContent?.mediaModal}
          isUnlocked={isSubscribed || selectedMedia.access === 'free' || unlockedMediaIds.includes(selectedMedia.id)}
          isSubscribed={isSubscribed}
          isInWatchlist={watchlistIds.includes(selectedMedia.id)}
          onClose={() => setSelectedMedia(null)}
          onUnlock={handleOpenUnlock}
          onOpenVip={() => {
            setSelectedMedia(null);
            setSubscriptionOpen(true);
          }}
          onToggleWatchlist={handleToggleWatchlist}
          onGoHome={handleGoHome}
        />
      )}

      {/* Nyole Checkout Gateway Modal */}
      {checkoutState.open && (
        <NyoleCheckoutModal
          mediaItem={checkoutState.item}
          subscriptionPlan={checkoutState.planName}
          subscriptionPrice={checkoutState.planPrice}
          onClose={() => setCheckoutState({ open: false })}
          onSuccess={handlePaymentSuccess}
          onGoHome={handleGoHome}
        />
      )}

      {/* VIP Subscription Modal */}
      {subscriptionOpen && (
        <SubscriptionModal
          content={siteContent?.vip}
          onClose={() => setSubscriptionOpen(false)}
          onSelectPlan={handleSelectSubscriptionPlan}
          isSubscribed={isSubscribed}
          onGoHome={handleGoHome}
        />
      )}

      {/* User Login/Register Modal */}
      {authOpen && (
        <AuthModal
          content={siteContent?.auth}
          onClose={() => setAuthOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            reloadMedia();
          }}
          onGoHome={handleGoHome}
        />
      )}

      {/* BUZZLEAKS Footer */}
      <footer className="border-t border-[#222222] bg-[#121212] py-10 px-6 mt-16 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <BuzzLeaksLogo size="sm" />
            <p className="text-zinc-400 max-w-md text-[11px] leading-relaxed">
              {siteContent?.general?.footerDescription || 'Plateforme haute performance de streaming vidéo 8K & Masters ProRes · Paiement sécurisé par Mobile Money (M-Pesa, MTN, Airtel, Orange, Wave) & Carte Bancaire.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-300">
            <button onClick={handleGoHome} className="hover:text-white transition-colors flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-[#FF0033]" />
              <span>Accueil</span>
            </button>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <button onClick={() => setSubscriptionOpen(true)} className="hover:text-white transition-colors">
              Pass VIP
            </button>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <button onClick={() => setCurrentTab('admin')} className="hover:text-white transition-colors">
              Console Admin
            </button>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="text-emerald-400 flex items-center gap-1.5 font-mono text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile Money M-Pesa, MTN, Airtel, Orange, Wave</span>
            </span>
          </div>

          <div className="text-zinc-400 font-mono text-[11px]">
            {siteContent?.general?.copyrightText || `© ${new Date().getFullYear()} BUZZLEAKS. Tous droits réservés.`}
          </div>
        </div>
      </footer>

      {/* Floating Quick Return & Home Page Bar (visible across all views when navigating) */}
      {canGoBack && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-full bg-black/95 hover:bg-[#18181b] text-white border border-[#27272a] hover:border-[#FF0033]/60 shadow-2xl shadow-black/80 backdrop-blur-md transition-all group active:scale-95 text-xs font-bold"
            title="Page précédente (Retour)"
            aria-label="Retour à la page précédente"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF0033] group-hover:-translate-x-1 transition-transform" />
            <span>Page précédente</span>
          </button>

          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-full bg-black/95 hover:bg-[#18181b] text-white border border-[#FF0033]/60 hover:border-[#FF0033] shadow-2xl shadow-[#FF0033]/30 backdrop-blur-md transition-all group active:scale-95 text-xs font-bold"
            title="Retour à la page d'accueil (Accueil BUZZLEAKS)"
            aria-label="Accueil BUZZLEAKS"
          >
            <Home className="w-4 h-4 text-[#FF0033] group-hover:scale-110 transition-transform" />
            <span>Accueil</span>
          </button>
        </div>
      )}
    </div>
  );
}
