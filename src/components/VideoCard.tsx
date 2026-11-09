import React, { useState, useRef } from 'react';
import { MediaItem } from '../types';
import { Play, Lock, Sparkles, Check, Bookmark, BookmarkCheck, Eye } from 'lucide-react';

interface VideoCardProps {
  item: MediaItem;
  isUnlocked: boolean;
  isInWatchlist?: boolean;
  onSelect: (item: MediaItem) => void;
  onQuickUnlock: (item: MediaItem) => void;
  onToggleWatchlist?: (item: MediaItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  item,
  isUnlocked,
  isInWatchlist = false,
  onSelect,
  onQuickUnlock,
  onToggleWatchlist
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<any>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const isExclusive = item.access === 'exclusive' || (item.access as any) === 'premium';
  const isLocked = isExclusive && !isUnlocked;

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      if (previewVideoRef.current && !isLocked) {
        previewVideoRef.current.currentTime = 0;
        previewVideoRef.current.play().catch(() => {});
      }
    }, 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
      className="group cursor-pointer rounded-2xl bg-[#121212] border border-[#222222] hover:border-[#FF0033]/60 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF0033]/15 hover:-translate-y-1"
    >
      {/* Thumbnail & Video Preview Area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        {/* Static poster image */}
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isLocked ? 'blur-[1.5px] contrast-90 brightness-75' : ''
          } ${isHovered && isVideoLoaded && !isLocked ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Dynamic Video Hover Preview (plays silently on hover if unlocked or teaser) */}
        {!isLocked && (
          <video
            ref={previewVideoRef}
            src={item.previewVideoUrl || item.mediaUrl}
            muted
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered && isVideoLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        )}

        {/* Ambient Dark Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

        {/* Top Badges (Access Status & Resolution) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5">
            {isExclusive ? (
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-black/90 text-[#FF334B] border border-[#FF0033]/40 backdrop-blur-md flex items-center gap-1 shadow-sm drop-shadow-[0_0_8px_rgba(255,0,51,0.3)]">
                <Lock className="w-2.5 h-2.5 text-[#FF0033]" />
                <span>Exclusif</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-black/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-sm">
                Gratuit
              </span>
            )}

            <span className="px-2 py-0.5 text-[10px] font-mono text-zinc-300 rounded bg-black/85 border border-[#222222] backdrop-blur-md">
              {item.resolution}
            </span>
          </div>

          {/* Watchlist Quick Button (Interactive on top-right) */}
          {onToggleWatchlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(item);
              }}
              className="p-1.5 rounded-lg bg-black/85 hover:bg-[#222222] text-zinc-300 hover:text-white border border-[#333333] pointer-events-auto backdrop-blur-md transition-colors"
              title={isInWatchlist ? 'Retirer de ma liste' : 'Ajouter à ma liste'}
            >
              {isInWatchlist ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-[#FF0033]" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Center Overlay if Locked */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none z-10">
            <div className="w-12 h-12 rounded-full bg-black/85 border border-[#FF0033]/50 text-[#FF0033] flex items-center justify-center mb-1.5 shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_rgba(255,0,51,0.5)]">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white drop-shadow">
              Réservé aux Abonnés VIP
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5">
              Accès illimité streaming & MP4
            </span>
          </div>
        )}

        {/* Center Play Icon on Hover if Unlocked */}
        {!isLocked && (
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none z-10 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white flex items-center justify-center shadow-2xl drop-shadow-[0_0_15px_rgba(255,0,51,0.6)] transform scale-95 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Video Duration Pill in bottom-right */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/90 border border-[#222222] text-[10px] font-mono text-zinc-200 backdrop-blur-md z-10 flex items-center gap-1">
          <Play className="w-2.5 h-2.5 fill-current text-zinc-400" />
          <span>{item.duration || 'Vidéo'}</span>
        </div>
      </div>

      {/* Video Metadata Container */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#121212]">
        <div>
          {/* Creator Channel row */}
          <div className="flex items-center gap-2 mb-2">
            <img
              src={item.author.avatar}
              alt={item.author.name}
              className="w-5 h-5 rounded-full object-cover shrink-0 border border-zinc-700/80"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs text-zinc-300 font-medium truncate">{item.author.name}</span>
            {item.author.verified && <Check className="w-3 h-3 text-[#FF0033] shrink-0" />}
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-xs text-[#FF334B] font-medium truncate">{item.category}</span>
          </div>

          {/* Video Title */}
          <h3 className="text-sm font-bold text-white group-hover:text-[#FF334B] transition-colors line-clamp-2 leading-snug mb-1.5">
            {item.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Footer: Views & Subscribe CTA */}
        <div className="pt-2.5 border-t border-[#222222] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px] tabular-nums">
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            <span>{item.viewsCount > 1000 ? `${(item.viewsCount / 1000).toFixed(1)}k vues` : `${item.viewsCount} vues`}</span>
          </div>

          <div>
            {isLocked ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickUnlock(item);
                }}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-md shadow-[#FF0033]/25 active:scale-95"
              >
                <Sparkles className="w-3 h-3" />
                <span>Pass VIP</span>
              </button>
            ) : (
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Disponible</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
