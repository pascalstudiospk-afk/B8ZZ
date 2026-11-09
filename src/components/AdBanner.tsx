import React from 'react';
import { AdBannerConfig } from '../types';
import { ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface AdBannerProps {
  banner: AdBannerConfig | null | undefined;
  positionName?: string;
  onAdClicked?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ banner, positionName, onAdClicked }) => {
  if (!banner || !banner.enabled) {
    return null;
  }

  const handleClick = async () => {
    try {
      await api.recordMonetizationClick({ bannerId: banner.id });
      onAdClicked?.();
      if (banner.targetUrl && !banner.targetUrl.startsWith('#')) {
        window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.error('Error tracking ad click:', e);
    }
  };

  // If custom script code provided
  if (banner.type === 'custom_html' && banner.customScriptCode) {
    return (
      <div className="w-full my-6 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-2 px-1">
          <span>Annonce Sponsorisée ({positionName || banner.position})</span>
          <span>Régie Partenaire</span>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: banner.customScriptCode }}
          className="overflow-hidden flex justify-center items-center min-h-[90px]"
        />
      </div>
    );
  }

  // Header leaderboard banner (728x90 style)
  if (banner.position === 'header_top') {
    return (
      <div className="w-full max-w-5xl mx-auto my-4 px-4">
        <div
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-[#121212] via-black to-[#121212] border border-[#FF0033]/25 hover:border-[#FF0033]/60 p-4 transition-all duration-200 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF0033]/15 border border-[#FF0033]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#FF0033]" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider text-[#FF334B]">
                  <span>Partenaire Vérifié · Mobile Money</span>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span>Offre Exclusive</span>
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-[#FF334B] transition-colors">
                  {banner.title || 'Monétisez votre audience créateur en direct'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              <span className="text-xs text-zinc-400 hidden md:inline">
                {banner.sponsorName || 'Passerelle Sécurisée 256-bit'}
              </span>
              <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 text-white transition-all flex items-center gap-1 shadow-sm shadow-[#FF0033]/25">
                <span>Découvrir</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Feed interstitial native banner
  return (
    <div className="col-span-full my-4">
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#121212] border border-[#222222] hover:border-[#FF0033]/40 p-5 transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 uppercase">
              <span className="text-[#FF334B] font-bold">Sponsor</span>
              <span aria-hidden="true">·</span>
              <span>{banner.sponsorName || 'Régie Partenaire'}</span>
              <span aria-hidden="true">·</span>
              <span>Offre Spéciale</span>
            </div>
            <h4 className="text-base font-semibold text-white group-hover:text-[#FF334B] transition-colors">
              {banner.title}
            </h4>
            <p className="text-xs text-zinc-400">
              Accélérez vos téléchargements 8K et profitez des remises exclusives réservées aux membres de la communauté.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="px-4 py-2 text-xs font-bold rounded-lg bg-zinc-900 group-hover:bg-gradient-to-r group-hover:from-[#FF0033] group-hover:to-[#FF4500] text-zinc-200 group-hover:text-white transition-all flex items-center gap-1.5 border border-[#222222] group-hover:border-transparent">
              <span>En savoir plus</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
