import React from 'react';
import { User } from '../types';
import { Shield, Sparkles, User as UserIcon, LogOut, CheckCircle, Flame, ArrowLeft, Home } from 'lucide-react';
import { BuzzLeaksLogo } from './BuzzLeaksLogo';

interface NavbarProps {
  currentTab: 'gallery' | 'library' | 'subscriptions' | 'admin';
  onSelectTab: (tab: 'gallery' | 'library' | 'subscriptions' | 'admin') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onToggleRole: () => void;
  onToggleSubscription?: () => void;
  onOpenSubscriptions: () => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onToggleRole,
  onToggleSubscription,
  onOpenSubscriptions,
  canGoBack,
  onGoBack
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-black/95 backdrop-blur-md border-b border-[#222222]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Back Button + Home Icon Button + Vector Flame & Typography Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onGoBack && canGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#222222] text-zinc-200 hover:text-white border border-[#27272a] hover:border-[#FF0033]/60 transition-all text-xs font-semibold group shadow-sm shrink-0"
              title="Retour à la page précédente"
              aria-label="Retour à la page précédente"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF0033] group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Retour</span>
            </button>
          )}

          {/* Quick Home Icon Button */}
          <button
            onClick={() => onSelectTab('gallery')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold shrink-0 group ${
              currentTab === 'gallery'
                ? 'bg-[#FF0033]/15 border-[#FF0033]/50 text-white shadow-sm shadow-[#FF0033]/20'
                : 'bg-[#18181b] hover:bg-[#222222] border-[#27272a] hover:border-[#FF0033]/50 text-zinc-300 hover:text-white'
            }`}
            title="Page d'accueil (Accueil BUZZLEAKS)"
            aria-label="Accueil BUZZLEAKS"
          >
            <Home className="w-4 h-4 text-[#FF0033] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Accueil</span>
          </button>

          <button
            onClick={() => onSelectTab('gallery')}
            className="group transition-transform hover:scale-[1.02] shrink-0 text-left focus:outline-none ml-1"
          >
            <BuzzLeaksLogo size="md" />
          </button>
        </div>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <button
            onClick={() => onSelectTab('gallery')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white flex items-center gap-1.5 ${
              currentTab === 'gallery' ? 'text-white font-semibold' : ''
            }`}
          >
            <Home className="w-3.5 h-3.5 text-[#FF0033]" />
            <span>Accueil & Catalogue</span>
          </button>

          <button
            onClick={() => onSelectTab('library')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentTab === 'library' ? 'text-white font-semibold' : ''
            }`}
          >
            Ma Bibliothèque
          </button>

          <button
            onClick={() => {
              onSelectTab('subscriptions');
              onOpenSubscriptions();
            }}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              currentTab === 'subscriptions'
                ? 'text-[#FF0033] font-bold drop-shadow-[0_0_8px_rgba(255,0,51,0.5)]'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF0033]" />
            <span>Pass VIP & Abonnements</span>
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white flex items-center gap-1.5 ${
              currentTab === 'admin' ? 'text-white font-semibold' : ''
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            Console Admin
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              {/* Quick Subscription State Toggle for testing */}
              {onToggleSubscription && (
                <button
                  onClick={onToggleSubscription}
                  title="Cliquer pour simuler l'état VIP Abonné / Non abonné"
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                    currentUser.subscription?.active
                      ? 'bg-[#FF0033]/15 border-[#FF0033]/50 text-white hover:bg-[#FF0033]/25 shadow-sm shadow-[#FF0033]/20'
                      : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#FF0033]" />
                  <span>Abonnement:</span>
                  <span className={currentUser.subscription?.active ? 'text-[#FF334B] font-bold' : 'text-zinc-500'}>
                    {currentUser.subscription?.active ? 'VIP ACTIF' : 'INACTIF'}
                  </span>
                </button>
              )}

              <button
                onClick={() => onSelectTab('library')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#222222] text-xs text-zinc-200 border border-[#27272a] transition-colors whitespace-nowrap"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-zinc-300" />
                  )}
                </div>
                <span className="font-medium max-w-[110px] truncate">{currentUser.name}</span>
                {currentUser.subscription?.active && (
                  <CheckCircle className="w-3.5 h-3.5 text-[#FF0033]" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 active:scale-95 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-lg shadow-[#FF0033]/30"
            >
              Connexion Membre
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
