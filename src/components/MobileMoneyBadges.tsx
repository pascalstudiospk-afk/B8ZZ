import React from 'react';
import { Smartphone, ShieldCheck, Check } from 'lucide-react';

interface MobileMoneyBadgesProps {
  className?: string;
  showText?: boolean;
  variant?: 'compact' | 'full' | 'ribbon';
}

export const MobileMoneyBadges: React.FC<MobileMoneyBadgesProps> = ({
  className = '',
  showText = true,
  variant = 'compact'
}) => {
  const operators = [
    {
      name: 'M-Pesa',
      badgeClass: 'bg-[#E60000]/15 text-[#FF334B] border-[#E60000]/30 hover:border-[#E60000]/60',
      dotClass: 'bg-[#E60000]'
    },
    {
      name: 'MTN MoMo',
      badgeClass: 'bg-[#FFCC00]/15 text-[#FFD700] border-[#FFCC00]/30 hover:border-[#FFCC00]/60',
      dotClass: 'bg-[#FFCC00]'
    },
    {
      name: 'Airtel Money',
      badgeClass: 'bg-[#FF0000]/15 text-[#FF4D4D] border-[#FF0000]/30 hover:border-[#FF0000]/60',
      dotClass: 'bg-[#FF0000]'
    },
    {
      name: 'Orange Money',
      badgeClass: 'bg-[#FF6600]/15 text-[#FF8533] border-[#FF6600]/30 hover:border-[#FF6600]/60',
      dotClass: 'bg-[#FF6600]'
    },
    {
      name: 'Wave',
      badgeClass: 'bg-[#00B4D8]/15 text-[#38BDF8] border-[#00B4D8]/30 hover:border-[#00B4D8]/60',
      dotClass: 'bg-[#00B4D8]'
    }
  ];

  if (variant === 'ribbon') {
    return (
      <div className={`p-3.5 rounded-xl bg-[#121212] border border-[#222222] space-y-2 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-[#FF0033]" />
            <span>Paiement Sécurisé Mobile Money Disponible</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Validation instantanée
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {operators.map(op => (
            <span
              key={op.name}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors flex items-center gap-1.5 ${op.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${op.dotClass}`} />
              <span>{op.name}</span>
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800">
            + Cartes Visa & Mastercard
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showText && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300">
          <Smartphone className="w-3.5 h-3.5 text-[#FF0033] shrink-0" />
          <span className="font-semibold text-white">Paiement sécurisé disponible :</span>
          <span className="text-zinc-400">M-Pesa, MTN, Airtel, Orange, Wave</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {operators.map(op => (
          <span
            key={op.name}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${op.badgeClass}`}
          >
            {op.name}
          </span>
        ))}
      </div>
    </div>
  );
};
