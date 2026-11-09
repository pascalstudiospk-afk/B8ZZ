import React from 'react';

interface BuzzLeaksLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export const BuzzLeaksLogo: React.FC<BuzzLeaksLogoProps> = ({
  className = '',
  size = 'md',
  iconOnly = false
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Flame Icon with Play Button */}
      <div className={`relative shrink-0 ${iconSizes[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(255,0,51,0.55)] transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="buzzleaks-flame-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF0033" />
              <stop offset="100%" stopColor="#FF4500" />
            </linearGradient>
            <linearGradient id="buzzleaks-glow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4500" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF0033" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Outer Stylized Flame Silhouette */}
          <path
            d="M50 3C56 18 64 28 72 38C82 50 86 64 82 77C77 91 64 98 50 98C36 98 23 91 18 77C14 64 18 50 28 38C36 28 44 18 50 3Z"
            fill="url(#buzzleaks-flame-grad)"
          />

          {/* Secondary Inner Flare Tongue */}
          <path
            d="M50 20C55 31 60 40 64 50C69 60 69 72 64 80C60 87 53 90 50 90C47 90 40 87 36 80C31 72 31 60 36 50C40 40 45 31 50 20Z"
            fill="#FFFFFF"
            fillOpacity="0.2"
          />

          {/* Core White Play Button Triangle */}
          <polygon
            points="44,40 66,51 44,62"
            fill="#FFFFFF"
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          />
        </svg>
      </div>

      {/* Typography: BUZZ (White) + LEAKS (Electric Red-Orange Gradient) */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className={`font-display font-black tracking-tighter ${textSizes[size]} flex items-center`}>
            <span className="text-white tracking-tight">BUZZ</span>
            <span className="bg-gradient-to-r from-[#FF0033] to-[#FF4500] bg-clip-text text-transparent ml-0.5 tracking-tight drop-shadow-[0_0_15px_rgba(255,0,51,0.4)]">
              LEAKS
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase -mt-0.5">
            EXCLUSIVE STREAM
          </span>
        </div>
      )}
    </div>
  );
};
