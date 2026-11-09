import React, { useState } from 'react';
import { X, Check, Sparkles, ShieldCheck, Zap, Smartphone, CreditCard, Lock, Flame, ArrowLeft, Home } from 'lucide-react';
import { MobileMoneyBadges } from './MobileMoneyBadges';
import { VipPageContent } from '../types';

interface SubscriptionModalProps {
  onClose: () => void;
  onSelectPlan: (planName: string, price: number) => void;
  isSubscribed?: boolean;
  onGoHome?: () => void;
  content?: VipPageContent;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  onClose,
  onSelectPlan,
  isSubscribed,
  onGoHome,
  content
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const plans = {
    monthly: {
      name: 'Pass VIP BUZZLEAKS Mensuel',
      price: content?.monthlyPrice !== undefined ? content.monthlyPrice : 9.99,
      period: content?.monthlyPeriodText || 'par mois',
      savings: null,
    },
    yearly: {
      name: 'Pass VIP BUZZLEAKS Annuel',
      price: content?.yearlyPrice !== undefined ? content.yearlyPrice : 79.99,
      period: content?.yearlyPeriodText || 'par an',
      savings: content?.yearlyDiscountBadge || 'Économisez 33% (2 mois offerts)',
    }
  };

  const perks = content?.perks && content.perks.length > 0 ? content.perks : [
    'Déverrouillage immédiat et illimité de 100% des contenus exclusifs',
    'Téléchargement direct des fichiers masters RAW 8K et profils DaVinci Resolve',
    'Streaming vidéo sans compression ProRes 4444 XQ',
    'Suppression complète de toutes les bannières publicitaires',
    'Accès prioritaire aux nouvelles sorties exclusives des réalisateurs'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/92 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#121212] border border-[#222222] shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF0033]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-6 border-b border-[#222222] gap-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-900 text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-colors text-xs font-semibold group shrink-0"
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black hover:bg-zinc-900 text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-colors text-xs font-semibold group shrink-0"
              title="Retour à la page d'accueil"
              aria-label="Accueil"
            >
              <Home className="w-4 h-4 text-[#FF0033] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Accueil</span>
            </button>

            <div className="ml-1">
              <div className="text-xs font-mono text-[#FF334B] uppercase tracking-wider flex items-center gap-1.5 mb-1 font-bold">
                <Flame className="w-3.5 h-3.5 text-[#FF0033]" />
                <span>{content?.headerBadge || 'Paiement Sécurisé Mobile Money & Carte Bancaire'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                {content?.title || 'Pass VIP BUZZLEAKS · Accès Illimité'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubscribed ? (
          <div className="my-8 p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Votre Pass VIP BUZZLEAKS est actuellement actif</h4>
            <p className="text-xs text-zinc-300">
              Vous bénéficiez d'un accès intégral à tous les médias exclusifs sans restriction de visionnage ou de téléchargement.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Prominent Mobile Money Highlight Ribbon */}
            <MobileMoneyBadges variant="ribbon" />

            {/* Period Switcher */}
            <div className="flex items-center justify-center">
              <div className="p-1 bg-black border border-[#222222] rounded-xl flex items-center gap-1 text-xs">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedPlan === 'monthly'
                      ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Mensuel ({plans.monthly.price.toFixed(2)} € / mois)
                </button>

                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    selectedPlan === 'yearly'
                      ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>Annuel ({plans.yearly.price.toFixed(2)} € / an)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black text-amber-300 border border-amber-400/30">
                    {content?.yearlyDiscountBadge || '-33%'}
                  </span>
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-6 rounded-2xl bg-black border border-[#FF0033]/30 text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
                {plans[selectedPlan].price.toFixed(2)} €
                <span className="text-sm font-normal text-zinc-400 ml-2 font-sans">
                  {plans[selectedPlan].period}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {content?.summaryNotice || 'Paiement sécurisé par Mobile Money (M-Pesa, MTN, Airtel, Orange, Wave) & Carte. Déverrouille instantanément les téléchargements MP4 et l\'intégralité du streaming exclusif.'}
              </p>
            </div>

            {/* Perks List */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Ce qui est inclus :</div>
              <div className="space-y-2">
                {perks.map((perk, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <div className="w-4 h-4 rounded-full bg-[#FF0033]/20 text-[#FF0033] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                onSelectPlan(plans[selectedPlan].name, plans[selectedPlan].price);
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 active:scale-95 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#FF0033]/35"
            >
              <Zap className="w-4 h-4 text-white" />
              <span>{content?.ctaButtonText || `S'abonner via Mobile Money & Carte (${plans[selectedPlan].price.toFixed(2)} €)`}</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{content?.guaranteeText || 'Paiement crypté 256-bit SSL · Annulation en 1 clic à tout moment'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

