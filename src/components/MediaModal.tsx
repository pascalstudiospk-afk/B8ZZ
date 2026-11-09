import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { api } from '../services/api';
import { MobileMoneyBadges } from './MobileMoneyBadges';
import {
  X,
  Lock,
  LockOpen,
  Sparkles,
  Download,
  Check,
  ShieldCheck,
  Share2,
  Bookmark,
  BookmarkCheck,
  Clock,
  Eye,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Smartphone,
  ArrowLeft,
  Home
} from 'lucide-react';
import { MediaModalPageContent } from '../types';

interface MediaModalProps {
  item: MediaItem | null;
  isUnlocked: boolean;
  isSubscribed?: boolean;
  isInWatchlist?: boolean;
  onClose: () => void;
  onUnlock: (item: MediaItem) => void;
  onOpenVip: () => void;
  onToggleWatchlist?: (item: MediaItem) => void;
  onGoHome?: () => void;
  content?: MediaModalPageContent;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  item,
  isUnlocked,
  isSubscribed = false,
  isInWatchlist = false,
  onClose,
  onUnlock,
  onOpenVip,
  onToggleWatchlist,
  onGoHome,
  content
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const isExclusive = item.access === 'exclusive' || (item.access as any) === 'premium';
  const isLocked = isExclusive && !isUnlocked;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleVideoProgress = (progressSeconds: number, durationSeconds: number) => {
    // Record history every 10 seconds or when completed
    if (Math.floor(progressSeconds) % 10 === 0) {
      api.recordWatchHistory({
        videoId: item.id,
        progressSeconds: Math.floor(progressSeconds),
        durationSeconds: Math.floor(durationSeconds),
        completed: progressSeconds / durationSeconds > 0.9
      });
    }
  };

  const handleDownloadClick = async () => {
    if (!item) return;

    // Strict Frontend verification: Subscription required to download direct MP4
    if (!isSubscribed) {
      onOpenVip();
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadError(null);

      // Call protected API (validates session & subscription via checkSubscription)
      const res = await api.requestDownload(item.id);

      // Trigger download via presigned one-time token without exposing raw URL in static DOM
      const link = document.createElement('a');
      link.href = res.downloadUrl;
      link.setAttribute('download', `BuzzLeaks_${item.title.replace(/\s+/g, '_')}.mp4`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      if (err.requiresSubscription) {
        onOpenVip();
      } else {
        setDownloadError(err.message || 'Erreur lors du téléchargement');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/95 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full rounded-2xl bg-[#121212] border border-[#222222] shadow-2xl overflow-hidden my-auto transition-all duration-300 ${
          isTheaterMode ? 'max-w-7xl' : 'max-w-5xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#222222] bg-black/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-[#1a1a1a] text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-colors text-xs font-semibold group shrink-0"
              title="Retour à la page précédente"
              aria-label="Retour à la page précédente"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF0033] group-hover:-translate-x-0.5 transition-transform" />
              <span>Retour</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onGoHome) onGoHome();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-[#1a1a1a] text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-colors text-xs font-semibold group shrink-0"
              title="Retour à l'accueil BUZZLEAKS"
              aria-label="Accueil"
            >
              <Home className="w-4 h-4 text-[#FF0033] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Accueil</span>
            </button>

            <span className="text-xs font-mono uppercase text-[#FF334B] font-bold tracking-wider truncate ml-1">
              {item.category}
            </span>
            <span aria-hidden="true" className="text-zinc-600 hidden sm:inline">·</span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">{item.resolution}</span>
            {isUnlocked && (
              <>
                <span aria-hidden="true" className="text-zinc-600 hidden sm:inline">·</span>
                <span className="text-xs text-emerald-400 font-medium hidden sm:flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Flux Débloqué
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onToggleWatchlist && (
              <button
                onClick={() => onToggleWatchlist(item)}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-[#222222]"
                title={isInWatchlist ? 'Dans ma liste' : 'Ajouter à ma liste'}
              >
                {isInWatchlist ? (
                  <BookmarkCheck className="w-4 h-4 text-[#FF0033]" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors border border-[#222222]"
              title="Copier le lien"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-[#222222]"
              title="Fermer (Échap)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player or Locked Paywall Area */}
        <div className="relative w-full bg-black">
          {isLocked ? (
            /* Locked Paywall view */
            <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden">
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover filter blur-md brightness-35 scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto z-10">
                <div className="w-16 h-16 rounded-full bg-[#FF0033]/15 border border-[#FF0033]/50 text-[#FF0033] flex items-center justify-center mb-4 shadow-2xl group-hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(255,0,51,0.5)]">
                  <Lock className="w-8 h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight font-display">
                  {content?.paywallTitle || 'Vidéo Exclusive BUZZLEAKS'}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 max-w-md">
                  {content?.paywallDescription || (
                    <>Ce flux haute fidélité en <strong className="text-[#FF334B]">{item.resolution}</strong> fait partie des exclusivités BUZZLEAKS. Le Pass VIP débloque le streaming complet et le téléchargement des masters MP4.</>
                  )}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                  <button
                    onClick={() => onUnlock(item)}
                    className="w-full sm:w-auto px-7 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 rounded-xl transition-all shadow-xl shadow-[#FF0033]/30 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Activer le Pass VIP (9,99 €/mois)</span>
                  </button>

                  <button
                    onClick={onOpenVip}
                    className="w-full sm:w-auto px-5 py-3 text-sm font-medium text-zinc-300 hover:text-white bg-[#18181b] hover:bg-[#222222] rounded-xl border border-[#333333] transition-colors"
                  >
                    Formules & Mobile Money
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Paiement sécurisé : M-Pesa, MTN, Airtel, Orange, Wave · Activation instantanée</span>
                </div>
              </div>
            </div>
          ) : (
            /* Custom Video Player Component */
            <VideoPlayer
              src={item.mediaUrl}
              poster={item.thumbnailUrl}
              title={item.title}
              resolution={item.resolution}
              isTheaterMode={isTheaterMode}
              onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
              onProgress={handleVideoProgress}
            />
          )}
        </div>

        {/* Modal Info Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-zinc-950 border-t border-zinc-900">
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5 font-mono">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{item.viewsCount} vues</span>
                </span>
                <span aria-hidden="true" className="text-zinc-700">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Durée : {item.duration || 'N/A'}</span>
                </span>
                <span aria-hidden="true" className="text-zinc-700">·</span>
                <span>Publié le {new Date(item.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                {item.title}
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Exclusive Perks Included */}
            {item.exclusivePerks && item.exclusivePerks.length > 0 && (
              <div className="p-4 rounded-xl bg-black/60 border border-[#222222]">
                <div className="text-xs font-bold text-[#FF334B] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Avantages Abonnés BUZZLEAKS VIP</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                  {item.exclusivePerks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF0033] shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-zinc-500 font-mono">Tags :</span>
              {item.tags.map(t => (
                <span key={t} className="text-xs text-zinc-300 bg-black/80 border border-[#222222] px-2 py-0.5 rounded">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Sidebar Creator & Status Box */}
          <div className="md:col-span-4 flex flex-col justify-between p-4 rounded-xl bg-black/70 border border-[#222222] space-y-4">
            <div className="space-y-3">
              <div className="text-xs font-mono text-zinc-400 uppercase">Créateur Exclusif</div>
              <div className="flex items-center gap-3">
                <img
                  src={item.author.avatar}
                  alt={item.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-zinc-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{item.author.name}</span>
                    {item.author.verified && <Check className="w-3.5 h-3.5 text-[#FF0033]" />}
                  </div>
                  <div className="text-xs text-zinc-400">Créateur Partenaire BUZZLEAKS</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#222222] space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Streaming en ligne :</span>
                <span className={item.access === 'free' ? 'text-emerald-400 font-bold' : 'text-[#FF334B] font-bold'}>
                  {item.access === 'free' ? 'Libre accès' : 'Abonnement VIP'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Téléchargement direct MP4 :</span>
                <span className={isSubscribed ? 'text-emerald-400 font-mono font-bold flex items-center gap-1' : 'text-[#FF334B] font-mono font-bold flex items-center gap-1'}>
                  {isSubscribed ? (
                    <>
                      <LockOpen className="w-3 h-3 text-emerald-400" />
                      <span>Déverrouillé (Actif)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-[#FF0033]" />
                      <span>Verrouillé (VIP Requis)</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Résolution native :</span>
                <span className="font-mono text-zinc-200">{item.resolution}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Membres ayant débloqué :</span>
                <span className="font-mono text-zinc-200">{item.unlockedCount}</span>
              </div>
            </div>

            {/* CONDITIONAL DOWNLOAD & SUBSCRIPTION ACTION */}
            {isLocked ? (
              <div className="space-y-3 pt-1">
                <button
                  onClick={() => onUnlock(item)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF0033]/30 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>S'abonner pour Débloquer (9,99 €/mois)</span>
                </button>
                <button
                  onClick={() => onOpenVip()}
                  className="w-full py-2 px-3 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-300 text-[11px] flex items-center justify-center gap-1.5 hover:text-white transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-[#FF0033]" />
                  <span>Téléchargement MP4 réservé aux abonnés VIP</span>
                </button>
                <MobileMoneyBadges variant="compact" showText={true} />
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {isSubscribed ? (
                  /* Subscribed: Unlocked MP4 Direct Download with LockOpen icon & Red-Orange Gradient */
                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadClick}
                      disabled={isDownloading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF0033]/30 disabled:opacity-50 active:scale-95"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <LockOpen className="w-4 h-4 text-white" />
                          <Download className="w-4 h-4 text-white" />
                        </>
                      )}
                      <span>
                        {isDownloading ? 'Préparation du flux sécurisé...' : `Télécharger MP4 (Abonnés) · ${item.resolution}`}
                      </span>
                    </button>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-mono">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Abonnement VIP Actif
                      </span>
                      <span>{content?.downloadUnlockedNotice || 'Master MP4 sans DRM'}</span>
                    </div>
                  </div>
                ) : (
                  /* Not Subscribed: Locked direct download with modal trigger & Mobile Money badges */
                  <div className="space-y-2.5">
                    <button
                      onClick={handleDownloadClick}
                      className="w-full p-3 rounded-xl bg-[#18181b] hover:bg-[#202024] text-zinc-200 hover:text-white font-medium text-xs transition-all flex items-center justify-between gap-3 border border-[#FF0033]/40 hover:border-[#FF0033] group shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FF0033]/15 text-[#FF0033] flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#FF0033] group-hover:to-[#FF4500] group-hover:text-white transition-all">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-xs text-white">Télécharger MP4 (Abonnés)</div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            Réservé aux membres VIP
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#FF0033]/20 text-[#FF334B] border border-[#FF0033]/40 group-hover:bg-[#FF0033] group-hover:text-white transition-all">
                        Débloquer
                      </span>
                    </button>

                    {/* Prominent Mobile Money Notice with Official Badges */}
                    <div className="p-2.5 rounded-lg bg-black/60 border border-[#222222]">
                      <MobileMoneyBadges variant="compact" showText={true} />
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed px-1">
                      {content?.downloadLockedNotice || `Streaming disponible en ligne. Le téléchargement direct du master MP4 (${item.resolution}) requiert un abonnement VIP actif.`}
                    </p>
                  </div>
                )}

                {downloadError && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{downloadError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
