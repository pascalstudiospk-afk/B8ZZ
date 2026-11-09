import React from 'react';
import { MediaItem } from '../types';
import { Play, Lock, Eye, CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface MediaCardProps {
  item: MediaItem;
  isUnlocked: boolean;
  onSelect: (item: MediaItem) => void;
  onQuickUnlock: (item: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  isUnlocked,
  onSelect,
  onQuickUnlock
}) => {
  const isExclusive = item.access === 'exclusive' || (item.access as any) === 'premium';
  const isLocked = isExclusive && !isUnlocked;

  return (
    <div
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
      className="group cursor-pointer rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-black/40"
    >
      {/* Media Visual Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isLocked ? 'blur-[2px] contrast-90 brightness-75' : ''
          }`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Ambient Dark Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            {isExclusive ? (
              <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md bg-zinc-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Exclusif</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-md bg-zinc-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-sm">
                Gratuit
              </span>
            )}

            <span className="px-2 py-0.5 text-[10px] font-mono text-zinc-300 rounded bg-zinc-950/70 border border-zinc-800 backdrop-blur-md">
              {item.resolution}
            </span>
          </div>

          {/* Subscription Required badge for Exclusive */}
          {isExclusive && (
            <div className="px-2.5 py-1 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 font-semibold text-[11px] backdrop-blur-md">
              Abonnement
            </div>
          )}
        </div>

        {/* Locked state central overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-zinc-950/85 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-2 shadow-lg backdrop-blur-md group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow">
              Réservé aux Abonnés
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5">
              Accès illimité avec l'Abonnement Exclusif
            </span>
          </div>
        )}

        {/* Free or Unlocked Media indicator */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/30 backdrop-blur-[1px]">
            <div className="w-12 h-12 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
              {item.type === 'video' ? (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </div>
          </div>
        )}

        {/* Video Duration / Image tag */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-zinc-300 backdrop-blur-md">
          {item.type === 'video' ? (
            <>
              <Play className="w-2.5 h-2.5" />
              <span>{item.duration || 'Vidéo'}</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-2.5 h-2.5" />
              <span>Haute Résolution</span>
            </>
          )}
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata: Category and Tags (Zero-Pill discipline: unboxed text with separators) */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <span className="text-amber-400/90 font-medium">{item.category}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="truncate">{item.tags[0] || 'Exclusive'}</span>
            {item.tags[1] && (
              <>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="truncate">{item.tags[1]}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-2">
            {item.title}
          </h3>

          {/* Description preview */}
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>

        {/* Footer: Creator & Actions */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={item.author.avatar}
              alt={item.author.name}
              className="w-5 h-5 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="text-zinc-300 font-medium truncate">{item.author.name}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-zinc-400 font-mono text-[11px] tabular-nums">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{item.viewsCount > 1000 ? `${(item.viewsCount / 1000).toFixed(1)}k` : item.viewsCount}</span>
            </span>

            {isUnlocked ? (
              <span className="text-emerald-400 flex items-center gap-1 font-sans font-medium text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Débloqué</span>
              </span>
            ) : isLocked ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickUnlock(item);
                }}
                className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-zinc-950 font-sans font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
                <span>S'abonner</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
