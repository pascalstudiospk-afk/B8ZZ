import React from 'react';
import { Play, Sparkles, Lock, ArrowRight, ShieldCheck, Smartphone, Flame } from 'lucide-react';
import { MobileMoneyBadges } from './MobileMoneyBadges';
import { HeroPageContent } from '../types';

interface HeroSectionProps {
  onExploreClick: () => void;
  onVipClick: () => void;
  content?: HeroPageContent;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onVipClick, content }) => {
  return (
    <section className="relative pt-6 pb-12 border-b border-[#222222] overflow-hidden bg-black">
      {/* Subtle Electric Red Ambient Lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF0033]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 left-10 w-80 h-80 bg-[#FF4500]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Prominent Mobile Money Notice Ribbon */}
        <MobileMoneyBadges variant="ribbon" className="mb-6" />

        {/* Split Screen Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch min-h-[460px]">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-6 flex flex-col justify-center py-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FF334B] mb-3 tracking-wider uppercase font-bold">
              <Flame className="w-4 h-4 text-[#FF0033]" />
              <span>{content?.badge || 'BUZZLEAKS · STREAMING EXCLUSIF'}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-emerald-400">{content?.badgeExtra || 'Mobile Money & CB'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12] mb-5 font-display text-balance">
              {content?.title || 'Vidéos exclusives, masters 8K et streaming haute fidélité.'}
            </h1>

            <p className="text-base text-zinc-300 leading-relaxed max-w-xl mb-8">
              {content?.subtitle || 'La plateforme de référence pour les réalisateurs, créateurs visuels et passionnés. Streaming instantané et téléchargement direct de masters MP4 déverrouillables via Mobile Money et Carte Bancaire.'}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreClick}
                className="px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 active:scale-95 rounded-xl transition-all flex items-center gap-2 shadow-xl shadow-[#FF0033]/30"
              >
                <span>{content?.primaryCtaText || 'Accéder au Catalogue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onVipClick}
                className="px-5 py-3.5 text-sm font-semibold text-zinc-200 hover:text-white bg-[#18181b] hover:bg-[#222222] border border-[#27272a] rounded-xl transition-colors flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-[#FF0033]" />
                <span>{content?.secondaryCtaText || 'Pass VIP (Mobile Money)'}</span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{content?.securityNote1 || 'Paiement Sécurisé SSL 256-bit'}</span>
              </div>
              <span aria-hidden="true" className="text-zinc-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#FF0033]" />
                <span>{content?.securityNote2 || 'Téléchargement Master MP4 Réservé VIP'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Container at Matching Height */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-[#222222] bg-[#121212] group flex">
            <img
              src={content?.heroImageUrl || '/src/assets/images/hero_cinematic_creator_1793938277680.jpg'}
              alt="Studio de post-production et étalonnage 8K RAW"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            {/* Floating Live Showcase Card */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/85 backdrop-blur-md border border-[#222222] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-[#FF334B] uppercase tracking-wider mb-0.5 font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#FF0033]" />
                  <span>{content?.showcaseBadge || 'Exclusivité BUZZLEAKS · DaVinci 8K'}</span>
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {content?.showcaseTitle || 'Masterclass Étalonnage Cinéma & Workflow Studio'}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {content?.showcaseSubtitle || 'Marcus Vance & Sarah Diaz · 42 min de contenu exclusif'}
                </div>
              </div>

              <button
                onClick={onExploreClick}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 text-white flex items-center justify-center shrink-0 transition-transform hover:scale-105 shadow-lg shadow-[#FF0033]/40"
                title="Lire l'aperçu"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-Width Metrics Row BELOW the split (Dynamic 4-column KPI strip) */}
        <div className="mt-12 pt-8 border-t border-[#222222] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">
              {content?.statsKpis?.views || '112K+'}
            </div>
            <div className="text-xs text-zinc-400">{content?.statsKpis?.viewsLabel || 'Vues Totales 8K'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#FF334B]">
              {content?.statsKpis?.masters || '100%'}
            </div>
            <div className="text-xs text-zinc-400">{content?.statsKpis?.mastersLabel || 'Masters Sans DRM'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">
              {content?.statsKpis?.subscribers || '2,480+'}
            </div>
            <div className="text-xs text-zinc-400">{content?.statsKpis?.subscribersLabel || 'Membres VIP Actifs'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400">
              {content?.statsKpis?.uptime || '99.9%'}
            </div>
            <div className="text-xs text-zinc-400">{content?.statsKpis?.uptimeLabel || 'Disponibilité CDN'}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
