import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'horizontal' | 'compact' | 'full';
  className?: string;
  currency?: string;
  theme?: 'light' | 'dark' | 'auto';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'horizontal', 
  className = '',
  currency = '$',
  theme = 'auto'
}) => {
  const sizes = {
    sm: { width: 24, height: 24, fontSize: '12px' },
    md: { width: 32, height: 32, fontSize: '16px' },
    lg: { width: 48, height: 48, fontSize: '24px' },
    xl: { width: 64, height: 64, fontSize: '32px' }
  };

  const currentSize = sizes[size];

  // Use the app's theme context
  const { theme: appTheme } = useTheme();
  
  // Determine current theme
  const currentTheme = theme === 'auto' ? appTheme : theme;
  
  // Debug logging - remove this later
  console.log('Logo Debug:', {
    appTheme,
    propTheme: theme,
    currentTheme,
    hasLightClass: document.documentElement.classList.contains('light'),
    hasDarkClass: document.documentElement.classList.contains('dark'),
  });
  const walletFill = currentTheme === 'dark' ? '#e0e0e0' : '#0c1f25';
  const walletStroke = currentTheme === 'dark' ? '#b0b0b0' : '#0c1f25';
  const stitchingStroke = currentTheme === 'dark' ? '#999' : '#3b3b3b';
  const cardFill = currentTheme === 'dark' ? '#c0c0c0' : '#2b3b44';

  // Enhanced wallet SVG component using detailed designs
  const WalletIcon = ({ width, height, fontSize }: { width: number; height: number; fontSize: number }) => {
    // Create a modified SVG based on theme with dynamic currency
    return (
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 160 160" 
        className="drop-shadow-sm"
        role="img" 
        aria-label={`Expense wallet icon (${currentTheme})`}
      >
        {/* Use the appropriate design based on theme */}
        {currentTheme === 'light' ? (
          // Light theme = Dark wallet design (DEBUG: Should be DARK wallet on LIGHT background)
          <>
            <defs>
              <linearGradient id={`g-currency-${size}`} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#b7ec42"/>
                <stop offset="1" stopColor="#9dd632"/>
              </linearGradient>

              <filter id={`f-shadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
                <feOffset dx="0" dy="4" result="off"/>
                <feGaussianBlur in="off" stdDeviation="6" result="blur"/>
                <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18" result="shadow"/>
                <feBlend in="SourceGraphic" in2="shadow" mode="normal"/>
              </filter>

              <linearGradient id={`g-flap-${size}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#243a3e"/>
                <stop offset="1" stopColor="#0c1f25"/>
              </linearGradient>

              <filter id={`f-currency-shadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#0c1f25" floodOpacity="0.25"/>
              </filter>
            </defs>

            <rect width="160" height="160" fill="none"/>

            <g filter={`url(#f-shadow-${size})`} transform="translate(12,24)">
              <rect x="0" y="16" rx="14" ry="14" width="136" height="84" fill="#0c1f25"/>
              <path d="M0 24 C8 8, 128 8, 136 24 L136 36 C128 20, 8 20, 0 36 Z" fill={`url(#g-flap-${size})`} opacity="0.98"/>
              <path d="M8 96 H128" fill="none" stroke="#173036" strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round" opacity="0.7"/>
              <rect x="16" y="36" rx="6" ry="6" width="56" height="36" fill="#12282b" stroke="#163436" strokeWidth="1" />
              <rect x="26" y="44" rx="4" ry="4" width="46" height="30" fill="#0d1f21" opacity="0.9" />
              
              <g transform="translate(100,46)">
                <circle cx="12" cy="8" r="10" fill="none" stroke="#35514a" strokeWidth="2"/>
                <circle cx="22" cy="18" r="8" fill="none" stroke="#2b443f" strokeWidth="2"/>
                <path d="M8 4 C10 2,14 2,16 4" stroke="#173f36" strokeWidth="1" fill="none" opacity="0.6"/>
              </g>

              <rect x="112" y="30" rx="5" ry="5" width="12" height="14" fill="#172e2f" stroke="#234341" strokeWidth="1"/>
              <path d="M6 28 Q68 12,130 28" fill="none" stroke="#1b3436" strokeWidth="2" opacity="0.08" strokeLinecap="round"/>

              <g transform="translate(40,62)">
                <rect x="-6" y="-22" rx="8" ry="8" width="64" height="44" fill="rgba(0,0,0,0)" />
                <text x="26" y="6" textAnchor="middle" fontFamily="Urbanist, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" fontWeight="700" fontSize={fontSize} fill={`url(#g-currency-${size})`} filter={`url(#f-currency-shadow-${size})`}>{currency}</text>
              </g>
            </g>
          </>
        ) : (
          // Dark theme = Light wallet design (DEBUG: Should be LIGHT wallet on DARK background)
          <>
            <defs>
              <linearGradient id={`g-currency_dark-${size}`} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#b7ec42"/>
                <stop offset="1" stopColor="#9dd632"/>
              </linearGradient>

              <filter id={`f-shadow_dark-${size}`} x="-50%" y="-50%" width="200%" height="200%">
                <feOffset dx="0" dy="3" result="off"/>
                <feGaussianBlur in="off" stdDeviation="5" result="blur"/>
                <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35" result="shadow"/>
                <feBlend in="SourceGraphic" in2="shadow" mode="normal"/>
              </filter>

              <linearGradient id={`g-wallet_light-${size}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#f7f9f8"/>
                <stop offset="1" stopColor="#e6ece9"/>
              </linearGradient>

              <filter id={`f-currency-shadow_dark-${size}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#081213" floodOpacity="0.28"/>
              </filter>
            </defs>

            <rect width="160" height="160" fill="none"/>

            <g filter={`url(#f-shadow_dark-${size})`} transform="translate(12,24)">
              <rect x="0" y="16" rx="14" ry="14" width="136" height="84" fill={`url(#g-wallet_light-${size})`} stroke="#d8e6e0" strokeWidth="1"/>
              <path d="M0 24 C8 8, 128 8, 136 24 L136 36 C128 20, 8 20, 0 36 Z" fill="#fbfdfc"/>
              <path d="M8 96 H128" fill="none" stroke="#c9d8d3" strokeWidth="1.4" strokeDasharray="3 4" strokeLinecap="round" opacity="0.9"/>
              <rect x="16" y="36" rx="6" ry="6" width="56" height="36" fill="#ffffff" stroke="#e7efeb" strokeWidth="0.8" opacity="0.95"/>
              <rect x="26" y="44" rx="4" ry="4" width="46" height="30" fill="#f6fbf9" opacity="0.95"/>

              <g transform="translate(100,46)">
                <circle cx="12" cy="8" r="10" fill="none" stroke="#c1d6b4" strokeWidth="1.6"/>
                <circle cx="22" cy="18" r="8" fill="none" stroke="#b0cb9f" strokeWidth="1.6"/>
              </g>

              <rect x="112" y="30" rx="5" ry="5" width="12" height="14" fill="#f2f7f5" stroke="#d3e6da" strokeWidth="0.8"/>
              <path d="M6 28 Q68 12,130 28" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.08" strokeLinecap="round"/>

              <g transform="translate(40,62)">
                <text x="26" y="6" textAnchor="middle" fontFamily="Urbanist, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" fontWeight="700" fontSize={fontSize} fill={`url(#g-currency_dark-${size})`} filter={`url(#f-currency-shadow_dark-${size})`}>{currency}</text>
              </g>
            </g>
          </>
        )}
      </svg>
    );
  };

  // Icon only variant
  if (variant === 'icon') {
    return (
      <div className={`relative ${className}`} style={{ width: currentSize.width, height: currentSize.height }}>
        <WalletIcon width={currentSize.width} height={currentSize.height} fontSize={24} />
      </div>
    );
  }

  // Horizontal variant with text
  if (variant === 'horizontal') {
    const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : size === 'xl' ? 'text-2xl' : 'text-base';
    const iconSize = size === 'sm' ? 20 : size === 'lg' ? 40 : size === 'xl' ? 48 : 32;
    
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`flex items-center justify-center`} 
             style={{ width: iconSize, height: iconSize }}>
          <WalletIcon width={iconSize} height={iconSize} fontSize={Math.floor(iconSize * 0.4)} />
        </div>
        <span className={`font-semibold bg-gradient-primary bg-clip-text text-transparent ${textSize}`}>
          Expenzo
        </span>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 20;
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`flex items-center justify-center`} 
             style={{ width: iconSize, height: iconSize }}>
          <WalletIcon width={iconSize} height={iconSize} fontSize={Math.floor(iconSize * 0.3)} />
        </div>
        <span className={`font-semibold text-primary ${textSize}`}>
          Expenzo
        </span>
      </div>
    );
  }

  // Full variant with tagline
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} variant="icon" currency={currency} theme={theme} />
      <div className="flex flex-col">
        <span className={`font-semibold bg-gradient-primary bg-clip-text text-transparent ${currentSize.fontSize}`}>
          Expenzo
        </span>
        <span className="text-xs text-muted-foreground">Smart Finance</span>
      </div>
    </div>
  );
};

export default Logo;