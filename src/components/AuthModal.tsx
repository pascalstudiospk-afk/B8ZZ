import React, { useState } from 'react';
import { api } from '../services/api';
import { User, AuthPageContent } from '../types';
import { X, Lock, Mail, ArrowRight, ArrowLeft, Home, UserCheck, Shield } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onGoHome?: () => void;
  content?: AuthPageContent;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess, onGoHome, content }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      let res;
      if (isRegister) {
        res = await api.login(email); // automatic login flow
      } else {
        res = await api.login(email);
      }
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('pascalstudios.PK@gmail.com');
    } else {
      setEmail('alexandre@gmail.com');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-[#121212] border border-[#222222] shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-[#222222] gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black hover:bg-zinc-900 text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-colors text-xs font-semibold group shrink-0"
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
              title="Retour à l'accueil"
              aria-label="Accueil"
            >
              <Home className="w-4 h-4 text-[#FF0033] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Accueil</span>
            </button>

            <div className="w-8 h-8 rounded-lg bg-[#FF0033]/15 text-[#FF0033] flex items-center justify-center shrink-0 ml-1">
              <Lock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono uppercase text-[#FF334B] font-bold truncate">
                {content?.brandBadge || 'BUZZLEAKS · Espace Membre'}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white font-display truncate">
                {isRegister ? (content?.registerTitle || 'Créer un Compte') : (content?.loginTitle || 'Connexion Plateforme')}
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

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Nom complet ou pseudonyme :</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Jean Valjean"
                className="w-full px-3 py-2 rounded-lg bg-black border border-[#222222] focus:border-[#FF0033] text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-zinc-300 mb-1 font-medium">Adresse email professionnelle :</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-black border border-[#222222] focus:border-[#FF0033] text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 active:scale-95 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF0033]/30"
          >
            <span>{isRegister ? 'Créer mon compte' : 'Se connecter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-[#222222] space-y-2">
            <div className="text-[11px] text-zinc-500 font-mono uppercase text-center">
              Comptes Démo de Test Rapide :
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 rounded-lg bg-black hover:bg-[#1a1a1a] border border-[#222222] text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[#FF334B] font-semibold text-[11px]">
                  <Shield className="w-3 h-3 text-[#FF0033]" />
                  <span>Compte Admin</span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate">pascalstudios...</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('user')}
                className="p-2 rounded-lg bg-black hover:bg-[#1a1a1a] border border-[#222222] text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-zinc-300 font-semibold text-[11px]">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span>Membre Standard</span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate">alexandre@...</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-zinc-400 hover:text-[#FF334B] text-xs transition-colors"
            >
              {isRegister ? 'Déjà un compte ? Connectez-vous' : 'Pas encore de compte ? S\'inscrire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
