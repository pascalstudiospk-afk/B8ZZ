import React, { useState } from 'react';
import { MediaItem } from '../types';
import { api } from '../services/api';
import { X, ShieldCheck, CheckCircle2, CreditCard, Smartphone, Wallet, ArrowRight, ArrowLeft, Home, Loader2, Sparkles, AlertCircle, Lock } from 'lucide-react';

interface NyoleCheckoutModalProps {
  mediaItem?: MediaItem | null;
  subscriptionPlan?: string | null;
  subscriptionPrice?: number;
  onClose: () => void;
  onSuccess: (unlockedMediaId?: string) => void;
  onGoHome?: () => void;
}

export const NyoleCheckoutModal: React.FC<NyoleCheckoutModalProps> = ({
  mediaItem,
  subscriptionPlan,
  subscriptionPrice,
  onClose,
  onSuccess,
  onGoHome
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'credit_card' | 'crypto'>('mobile_money');
  const [mobileOperator, setMobileOperator] = useState<'mpesa' | 'mtn' | 'airtel' | 'orange' | 'wave'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [step, setStep] = useState<'select' | 'processing' | 'webhook_confirm' | 'success'>('select');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentTxId, setPaymentTxId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const amount = subscriptionPrice || (mediaItem ? 9.99 : 9.99);
  const title = subscriptionPlan || 'Pass VIP BUZZLEAKS (Accès Streaming & Téléchargements MP4)';

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.createNyoleCheckout({
        type: 'subscription',
        paymentMethod,
        planName: subscriptionPlan || 'Pass VIP BUZZLEAKS Mensuel'
      });

      setTransactionRef(res.transactionRef);
      setPaymentTxId(res.nyoleTransactionId);
      setStep('webhook_confirm');
    } catch (err: any) {
      setError(err.message || 'Impossible d\'initialiser le paiement sécurisé');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.simulateNyoleWebhook(transactionRef);
      setStep('success');
      setTimeout(() => {
        onSuccess(mediaItem?.id);
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Échec de confirmation du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#121212] border border-[#222222] shadow-2xl p-6 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222222] gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => {
                if (step === 'webhook_confirm') {
                  setStep('select');
                } else {
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black hover:bg-zinc-900 text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-colors text-xs font-semibold group shrink-0"
              title="Retour à l'étape ou page précédente"
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

            <div className="w-8 h-8 rounded-xl bg-[#FF0033]/15 border border-[#FF0033]/40 flex items-center justify-center text-[#FF0033] shrink-0 ml-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-[#FF334B] uppercase tracking-wider flex items-center gap-1.5 font-bold truncate">
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>Paiement Sécurisé Mobile Money & Carte</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white font-display truncate">Pass VIP BUZZLEAKS</h3>
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
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Select payment method & review */}
        {step === 'select' && (
          <div className="mt-5 space-y-5">
            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-black border border-[#222222] space-y-2">
              <div className="text-[11px] font-mono text-zinc-400 uppercase">Détail de votre abonnement</div>
              <div className="text-sm font-semibold text-white line-clamp-1">{title}</div>
              <div className="flex items-center justify-between pt-2 border-t border-[#222222]">
                <span className="text-xs text-zinc-400">Montant total à régler :</span>
                <span className="text-lg font-bold font-mono text-[#FF334B] tabular-nums">
                  {amount.toFixed(2)} EUR
                </span>
              </div>
            </div>

            {/* Mobile Money Highlight Banner */}
            <div className="p-3 rounded-xl bg-black/80 border border-[#222222] flex items-center gap-2.5 text-xs text-zinc-200">
              <Smartphone className="w-4 h-4 text-[#FF0033] shrink-0" />
              <span>
                <strong className="text-white">Paiement sécurisé par Mobile Money disponible :</strong> Déblocage instantané du streaming 8K et des téléchargements MP4.
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">Sélectionnez votre moyen de paiement :</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile_money')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    paymentMethod === 'mobile_money'
                      ? 'border-[#FF0033] bg-[#FF0033]/10 text-white shadow-md shadow-[#FF0033]/20'
                      : 'border-[#222222] bg-black/50 text-zinc-300 hover:bg-[#18181b]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Smartphone className="w-4 h-4 text-[#FF0033]" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FF0033]/20 text-[#FF334B] font-bold">Populaire</span>
                  </div>
                  <div className="text-xs font-bold">Mobile Money</div>
                  <div className="text-[10px] text-zinc-400">M-Pesa, MTN, Airtel, Orange, Wave</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-[#FF0033] bg-[#FF0033]/10 text-white shadow-md'
                      : 'border-[#222222] bg-black/50 text-zinc-300 hover:bg-[#18181b]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <div className="text-xs font-bold">Carte Bancaire</div>
                  <div className="text-[10px] text-zinc-400">Visa, Mastercard (3D Secure)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    paymentMethod === 'crypto'
                      ? 'border-[#FF0033] bg-[#FF0033]/10 text-white shadow-md'
                      : 'border-[#222222] bg-black/50 text-zinc-300 hover:bg-[#18181b]'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-purple-400" />
                  <div className="text-xs font-bold">Crypto & Web3</div>
                  <div className="text-[10px] text-zinc-400">USDT, USDC, BTC</div>
                </button>
              </div>
            </div>

            {/* If Mobile Money selected, show operator pills including M-Pesa, MTN, Airtel */}
            {paymentMethod === 'mobile_money' && (
              <div className="p-3.5 rounded-xl bg-black border border-[#222222] space-y-3">
                <div className="text-[11px] font-mono text-zinc-300 font-bold uppercase tracking-wider">
                  Opérateur Mobile Money :
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'mpesa', label: 'M-Pesa', badge: 'bg-[#E60000]/15 text-[#FF334B] border-[#E60000]/40' },
                    { id: 'mtn', label: 'MTN MoMo', badge: 'bg-[#FFCC00]/15 text-[#FFD700] border-[#FFCC00]/40' },
                    { id: 'airtel', label: 'Airtel', badge: 'bg-[#FF0000]/15 text-[#FF4D4D] border-[#FF0000]/40' },
                    { id: 'orange', label: 'Orange', badge: 'bg-[#FF6600]/15 text-[#FF8533] border-[#FF6600]/40' },
                    { id: 'wave', label: 'Wave', badge: 'bg-[#00B4D8]/15 text-[#38BDF8] border-[#00B4D8]/40' }
                  ].map(op => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setMobileOperator(op.id as any)}
                      className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all border text-center ${
                        mobileOperator === op.id
                          ? 'border-[#FF0033] bg-gradient-to-r from-[#FF0033]/30 to-[#FF4500]/30 text-white shadow-sm ring-1 ring-[#FF0033]'
                          : `${op.badge} hover:brightness-125`
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Numéro de téléphone Mobile Money :</label>
                  <input
                    type="tel"
                    placeholder="ex: +243 ... / +225 ... / +237 ..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#333333] text-white font-mono text-xs focus:outline-none focus:border-[#FF0033]"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleInitiatePayment}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 active:scale-95 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#FF0033]/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Initialisation du paiement sécurisé...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-white" />
                  <span>
                    {paymentMethod === 'mobile_money'
                      ? `Payer par Mobile Money (${amount.toFixed(2)} €)`
                      : `Valider le paiement (${amount.toFixed(2)} €)`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chiffrement bancaire 256-bit SSL · Déblocage sans délai</span>
            </div>
          </div>
        )}


        {/* Step 2: Webhook confirmation & Simulator */}
        {step === 'webhook_confirm' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#FF0033]/10 border border-[#FF0033]/30 text-white">
              <div className="text-xs font-bold flex items-center gap-2 mb-1 text-[#FF334B]">
                <Smartphone className="w-4 h-4 text-[#FF0033]" />
                <span>Session de Paiement Sécurisée Active</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Référence de commande : <span className="font-mono text-white font-bold">{transactionRef}</span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                ID Transaction : <span className="font-mono text-zinc-300">{paymentTxId}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black border border-[#222222] space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF0033]" />
                <span>Confirmation Instantanée Mobile Money & Webhook :</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Le paiement est traité de manière sécurisée en arrière-plan. Dès la validation sur votre mobile (M-Pesa, MTN, Airtel, Orange ou Wave), le pass VIP est activé et débloque le streaming et le téléchargement des masters MP4.
              </p>

              <button
                onClick={handleSimulateWebhook}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 active:scale-95 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF0033]/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Vérification de la transaction en cours...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Confirmer le paiement Mobile Money & Débloquer l'accès</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success state */}
        {step === 'success' && (
          <div className="mt-6 py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white font-display">Paiement Mobile Money Validé avec Succès !</h4>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto">
              Votre transaction a été confirmée. Votre pass VIP BUZZLEAKS est maintenant actif et tous les téléchargements MP4 sont débloqués.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

