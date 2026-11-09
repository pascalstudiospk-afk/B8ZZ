import React, { useState, useEffect } from 'react';
import { MediaItem, NyoleTransaction, User } from '../types';
import { api } from '../services/api';
import { VideoCard } from './VideoCard';
import {
  CheckCircle2,
  FileText,
  Sparkles,
  Bookmark,
  History,
  Play,
  Film,
  Loader2,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Home,
  UserCheck
} from 'lucide-react';
import { LibraryPageContent } from '../types';

interface UserLibraryViewProps {
  currentUser: User | null;
  onSelectMedia: (item: MediaItem) => void;
  onExploreCatalog: () => void;
  onOpenVip: () => void;
  onToggleWatchlist?: (item: MediaItem) => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  content?: LibraryPageContent;
}

export const UserLibraryView: React.FC<UserLibraryViewProps> = ({
  currentUser,
  onSelectMedia,
  onExploreCatalog,
  onOpenVip,
  onToggleWatchlist,
  onGoBack,
  onGoHome,
  content
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history' | 'unlocked' | 'transactions'>('watchlist');
  const [unlockedMedia, setUnlockedMedia] = useState<MediaItem[]>([]);
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [history, setHistory] = useState<{ videoId: string; watchedAt: string; video: MediaItem; progressSeconds?: number }[]>([]);
  const [transactions, setTransactions] = useState<NyoleTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadLibraryData();
  }, [currentUser]);

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      const [libRes, purchasesRes, watchRes, histRes] = await Promise.all([
        api.getUserLibrary(),
        api.getUserPurchases(),
        api.getWatchlist(),
        api.getWatchHistory()
      ]);
      setUnlockedMedia(libRes.unlockedMedia);
      setTransactions(purchasesRes.purchases);
      setWatchlist(watchRes.watchlist || []);
      setHistory(histRes.history || []);
    } catch (e) {
      console.error('Error loading library:', e);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = Boolean(currentUser?.subscription?.active);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Back & Home Navigation Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onGoBack || onExploreCatalog}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-[#1a1a1a] text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-all text-xs font-semibold group shadow-sm"
            title="Retour à la page précédente"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF0033] group-hover:-translate-x-1 transition-transform" />
            <span>Page précédente</span>
          </button>

          <button
            onClick={onGoHome || onExploreCatalog}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-[#1a1a1a] text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-all text-xs font-semibold group shadow-sm"
            title="Retour à la page d'accueil (Catalogue)"
          >
            <Home className="w-4 h-4 text-[#FF0033] group-hover:scale-110 transition-transform" />
            <span>Accueil</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 hidden sm:flex items-center gap-1.5">
          <span>BUZZLEAKS</span>
          <span>&gt;</span>
          <span className="text-zinc-300">Ma Bibliothèque</span>
        </div>
      </div>

      {/* Profile Banner Card */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'}
            alt={currentUser?.name || 'Abonné'}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#FF0033]/60 shadow-lg shadow-[#FF0033]/20"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display">
                {currentUser?.name || content?.title || 'Espace Membre'}
              </h2>
              {isSubscribed ? (
                <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold rounded bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white flex items-center gap-1 shadow-md shadow-[#FF0033]/30">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>{content?.activePassBadge || 'Pass VIP BUZZLEAKS'}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-zinc-800 text-zinc-400">
                  {content?.freePassBadge || 'Compte Gratuit'}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{currentUser?.email}</p>
            <div className="text-[11px] text-zinc-500 font-mono mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-600" />
              <span>Membre depuis : {new Date(currentUser?.createdAt || '2026-01-15').toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <div className="p-3.5 rounded-xl bg-black border border-[#222222] text-right">
              <div className="text-[10px] font-mono uppercase text-zinc-400">Pass Actif</div>
              <div className="text-xs font-bold text-[#FF334B]">{currentUser?.subscription?.planName}</div>
            </div>
          ) : (
            <button
              onClick={onOpenVip}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 active:scale-95 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-[#FF0033]/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Activer le Pass VIP</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-[#222222] overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'watchlist'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'text-zinc-400 hover:text-zinc-200 bg-[#121212] border border-[#222222]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Ma Liste ({watchlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'text-zinc-400 hover:text-zinc-200 bg-[#121212] border border-[#222222]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historique ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('unlocked')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'unlocked'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'text-zinc-400 hover:text-zinc-200 bg-[#121212] border border-[#222222]'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Vidéos Débloquées ({unlockedMedia.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'text-zinc-400 hover:text-zinc-200 bg-[#121212] border border-[#222222]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reçus de Paiement ({transactions.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs">Chargement de votre espace personnalisé...</span>
        </div>
      ) : activeTab === 'watchlist' ? (
        /* ================= 1. WATCHLIST ================= */
        watchlist.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <Bookmark className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">Votre liste est vide</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              Ajoutez des vidéos à votre liste depuis le catalogue pour les retrouver facilement à tout moment.
            </p>
            <button
              onClick={onExploreCatalog}
              className="px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors"
            >
              Parcourir le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map(item => (
              <VideoCard
                key={item.id}
                item={item}
                isUnlocked={isSubscribed || item.access === 'free'}
                isInWatchlist={true}
                onSelect={onSelectMedia}
                onQuickUnlock={onOpenVip}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        )
      ) : activeTab === 'history' ? (
        /* ================= 2. WATCH HISTORY ================= */
        history.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">Aucune vidéo visionnée récemment</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              Commencez à regarder des vidéos pour suivre automatiquement votre progression de lecture.
            </p>
            <button
              onClick={onExploreCatalog}
              className="px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors"
            >
              Découvrir les vidéos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(entry => (
              <div
                key={`${entry.videoId}-${entry.watchedAt}`}
                onClick={() => onSelectMedia(entry.video)}
                className="group cursor-pointer p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                    <img
                      src={entry.video.thumbnailUrl}
                      alt={entry.video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-amber-400 fill-current" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                      {entry.video.title}
                    </h4>
                    <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                      <span>{entry.video.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{entry.video.duration}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-zinc-500 text-[11px]">
                        Vu le {new Date(entry.watchedAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <button className="px-3.5 py-1.5 rounded-lg bg-zinc-800 group-hover:bg-amber-400 text-zinc-200 group-hover:text-zinc-950 font-semibold text-xs transition-colors flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Reprendre</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'unlocked' ? (
        /* ================= 3. UNLOCKED MEDIA ================= */
        unlockedMedia.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">Aucune vidéo débloquée</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              Activez l'abonnement exclusif pour débloquer immédiatement l'intégralité du catalogue.
            </p>
            <button
              onClick={onOpenVip}
              className="px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors"
            >
              S'abonner (Mobile Money & CB)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {unlockedMedia.map(item => (
              <VideoCard
                key={item.id}
                item={item}
                isUnlocked={true}
                isInWatchlist={currentUser?.watchlist?.includes(item.id)}
                onSelect={onSelectMedia}
                onQuickUnlock={() => onSelectMedia(item)}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        )
      ) : (
        /* ================= 4. TRANSACTIONS ================= */
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-mono text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Réf. Transaction</th>
                <th className="py-3 px-4">Formule d'Abonnement</th>
                <th className="py-3 px-4">Méthode</th>
                <th className="py-3 px-4">Montant</th>
                <th className="py-3 px-4">Statut Webhook</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-amber-400">{tx.transactionRef}</td>
                  <td className="py-3.5 px-4 font-sans text-white font-medium">{tx.mediaTitle || 'Abonnement Exclusif'}</td>
                  <td className="py-3.5 px-4 font-sans uppercase text-[11px] text-zinc-400">
                    {tx.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4 font-bold tabular-nums text-white">
                    {tx.amount.toFixed(2)} {tx.currency}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-sans text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Validé</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                    {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
