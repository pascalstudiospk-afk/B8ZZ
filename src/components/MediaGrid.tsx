import React, { useState } from 'react';
import { MediaItem, AdBannerConfig, CategoryItem } from '../types';
import { VideoCard } from './VideoCard';
import { AdBanner } from './AdBanner';
import { Search, SlidersHorizontal, Sparkles, Filter, X, Film, Flame, ArrowLeft, Home } from 'lucide-react';

interface MediaGridProps {
  media: MediaItem[];
  categories?: CategoryItem[];
  unlockedMediaIds: string[];
  watchlistIds?: string[];
  isSubscribed: boolean;
  adBanners: AdBannerConfig[];
  onSelectMedia: (item: MediaItem) => void;
  onQuickUnlock: (item: MediaItem) => void;
  onToggleWatchlist?: (item: MediaItem) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  categories = [],
  unlockedMediaIds,
  watchlistIds = [],
  isSubscribed,
  adBanners,
  onSelectMedia,
  onQuickUnlock,
  onToggleWatchlist
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [accessFilter, setAccessFilter] = useState<'all' | 'free' | 'exclusive'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'popular' | 'newest' | 'views'>('popular');

  // Category pill list from dynamic categories or fallback
  const categoryNames = ['Tous', ...categories.filter(c => c.slug !== 'tous').map(c => c.name)];

  // Client-side filtering & sorting
  const filteredItems = media.filter(item => {
    const isItemExclusive = item.access === 'exclusive' || (item.access as any) === 'premium';
    const matchesCategory =
      selectedCategory === 'Tous' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase() ||
      item.categories?.some(c => c.toLowerCase() === selectedCategory.toLowerCase());

    const matchesAccess =
      accessFilter === 'all' ||
      (accessFilter === 'free' ? item.access === 'free' : isItemExclusive);

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.author.name.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q));

    return matchesCategory && matchesAccess && matchesSearch;
  });

  filteredItems.sort((a, b) => {
    if (sortOption === 'popular' || sortOption === 'views') return b.viewsCount - a.viewsCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const interstitialBanner = adBanners.find(b => b.position === 'feed_interstitial' && b.enabled);

  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Controls & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#FF334B] font-bold mb-1">
            <Flame className="w-3.5 h-3.5 text-[#FF0033]" />
            <span>Catalogue Exclusif · Masters ProRes & 8K</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
            Streaming & Téléchargements
          </h2>
        </div>

        {/* Instant Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un flux, une masterclass, un tag..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#121212] border border-[#222222] focus:border-[#FF0033] focus:ring-1 focus:ring-[#FF0033] text-xs text-zinc-100 placeholder-zinc-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Category Pill Bar (Horizontal scroll with smooth snap) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-5 mb-6 border-b border-[#222222]">
        {/* Category Pills & Optional Back Button */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin">
          {(selectedCategory !== 'Tous' || searchQuery || accessFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategory('Tous');
                setSearchQuery('');
                setAccessFilter('all');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-[#1a1a1a] text-zinc-300 hover:text-white border border-[#FF0033]/40 hover:border-[#FF0033] transition-all whitespace-nowrap shrink-0 group"
              title="Retour à l'affichage de toutes les vidéos"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FF0033] group-hover:-translate-x-0.5 transition-transform" />
              <span>Retour (Tous)</span>
            </button>
          )}

          {categoryNames.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/30 scale-[1.02]'
                  : 'bg-[#121212] hover:bg-[#1c1c1c] text-zinc-300 border border-[#222222]'
              }`}
            >
              {cat === 'Tous' && <Home className="w-3.5 h-3.5 shrink-0" />}
              <span>{cat === 'Tous' ? 'Tous les flux' : cat}</span>
            </button>
          ))}
        </div>

        {/* Secondary Access & Sort Segmented Controls */}
        <div className="flex items-center gap-3 self-end lg:self-auto shrink-0">
          {/* Access Filter (Free vs Exclusive) */}
          <div className="flex items-center p-0.5 bg-[#121212] rounded-lg border border-[#222222] text-xs">
            <button
              onClick={() => setAccessFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                accessFilter === 'all' ? 'bg-[#222222] text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tous ({media.length})
            </button>
            <button
              onClick={() => setAccessFilter('free')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                accessFilter === 'free' ? 'bg-[#222222] text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Gratuit
            </button>
            <button
              onClick={() => setAccessFilter('exclusive')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                accessFilter === 'exclusive' ? 'bg-[#222222] text-[#FF334B] font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              VIP Exclusif
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-[#121212] border border-[#222222] rounded-lg px-2.5 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent text-zinc-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="popular" className="bg-zinc-900 text-zinc-200">Tendances & Vues</option>
              <option value="newest" className="bg-zinc-900 text-zinc-200">Date d'ajout</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Video Cards */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
          <Filter className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Aucune vidéo ne correspond à vos filtres</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Essayez de modifier votre recherche ou sélectionnez une autre catégorie vidéo.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('Tous');
              setAccessFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 border border-amber-400/40 rounded-lg hover:bg-amber-400/10 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const isUnlocked = isSubscribed || item.access === 'free' || unlockedMediaIds.includes(item.id);
            const isInWatchlist = watchlistIds.includes(item.id);

            return (
              <React.Fragment key={item.id}>
                <VideoCard
                  item={item}
                  isUnlocked={isUnlocked}
                  isInWatchlist={isInWatchlist}
                  onSelect={onSelectMedia}
                  onQuickUnlock={onQuickUnlock}
                  onToggleWatchlist={onToggleWatchlist}
                />
                {/* Native In-Feed Sponsor Card after 3rd video */}
                {index === 2 && interstitialBanner && (
                  <AdBanner banner={interstitialBanner} positionName="In-Feed Sponsorisé" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
};
