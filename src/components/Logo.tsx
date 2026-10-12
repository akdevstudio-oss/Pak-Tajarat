import React from 'react';
import { useApp } from '../context/AppContext';

interface LogoProps {
  className?: string;
  size?: number; // Size of the logo in pixels
  showText?: boolean;
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 48,
  showText,
  variant
}) => {
  // Access global custom logo settings safely
  let logoSettings = {
    sizePreset: 'medium' as 'small' | 'medium' | 'large' | 'custom',
    sizeScale: 1.0,
    showText: true,
    variant: 'default' as 'full' | 'icon' | 'default',
    customText: 'PAK-TAJARAT',
    logoType: 'vector' as 'vector' | 'image',
    logoImageUrl: '',
  };

  try {
    const context = useApp();
    if (context && context.brandingConfig) {
      const b = context.brandingConfig;
      const imageUrl = b.logoImageUrl || (b as any).websiteLogo || (context.logoConfig?.logoImageUrl) || '';
      const type = b.logoType || (imageUrl ? 'image' : 'vector');
      logoSettings = {
        ...logoSettings,
        logoType: type,
        logoImageUrl: imageUrl,
        customText: b.customText || logoSettings.customText
      };
    } else if (context && context.logoConfig) {
      logoSettings = {
        ...logoSettings,
        ...context.logoConfig,
        logoType: context.logoConfig.logoType || (context.logoConfig.logoImageUrl ? 'image' : 'vector')
      };
    }
  } catch (e) {
    // Graceful fallback outside provider
  }

  // Determine final variant
  const finalVariant = variant !== undefined ? variant : (logoSettings.variant === 'default' ? 'full' : logoSettings.variant as 'full' | 'icon');

  // Determine final showText
  const finalShowText = showText !== undefined ? showText : logoSettings.showText;

  // Determine final size based on presets and scale
  let finalSize = size;
  if (logoSettings.sizePreset === 'small') {
    finalSize = Math.round(size * 0.7);
  } else if (logoSettings.sizePreset === 'large') {
    finalSize = Math.round(size * 1.4);
  } else {
    // Medium or Custom uses the direct sizeScale multiplier
    finalSize = Math.round(size * logoSettings.sizeScale);
  }

  // Determine final text
  const finalBrandText = logoSettings.customText || 'PAK-TAJARAT';

  // Support for Image-based logo
  if (logoSettings.logoType === 'image' && logoSettings.logoImageUrl) {
    return (
      <div className={`flex items-center select-none ${className}`} style={{ gap: `${Math.round(finalSize * 0.15)}px` }}>
        <img
          src={logoSettings.logoImageUrl}
          alt={finalBrandText}
          style={{ width: `${finalSize}px`, height: `${finalSize}px`, objectFit: 'contain' }}
          className="rounded-lg max-w-full"
          referrerPolicy="no-referrer"
        />
        {finalVariant !== 'icon' && finalShowText && (
          <span 
            className="font-black tracking-wide text-gray-900 dark:text-white font-sans" 
            style={{ fontSize: `${Math.round(finalSize * 0.42)}px` }}
          >
            {finalBrandText}
          </span>
        )}
      </div>
    );
  }

  if (finalVariant === 'icon') {
    // Return just the inner icon PT part without text/circles, or a simplified version
    return (
      <svg
        width={finalSize}
        height={finalSize}
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} select-none`}
      >
        <defs>
          <linearGradient id="ptNavyGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B1B3D" />
            <stop offset="40%" stopColor="#1B365D" />
            <stop offset="70%" stopColor="#2E5077" />
            <stop offset="100%" stopColor="#0B1B3D" />
          </linearGradient>
          <linearGradient id="ptGoldGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A0724C" />
            <stop offset="30%" stopColor="#E5C19E" />
            <stop offset="60%" stopColor="#C49B75" />
            <stop offset="100%" stopColor="#8F5E38" />
          </linearGradient>
          <filter id="ptShadowIcon" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Crescent/Gold Swoop on the left */}
        <path
          d="M 230 160 C 120 180, 80 340, 160 450 C 230 550, 340 500, 340 500 C 340 500, 250 490, 200 420 C 160 360, 170 240, 230 160 Z"
          fill="url(#ptGoldGradIcon)"
          filter="url(#ptShadowIcon)"
        />

        {/* Monogram P - Navy Blue with gradient and border */}
        <text
          x="190"
          y="390"
          fontFamily="'Georgia', 'Times New Roman', serif"
          fontWeight="bold"
          fontSize="280"
          fill="url(#ptNavyGradIcon)"
          stroke="#1F3D68"
          strokeWidth="2"
          filter="url(#ptShadowIcon)"
        >
          P
        </text>

        {/* Monogram T - Rose Gold/Bronze with gradient */}
        <text
          x="285"
          y="440"
          fontFamily="'Georgia', 'Times New Roman', serif"
          fontWeight="bold"
          fontSize="250"
          fill="url(#ptGoldGradIcon)"
          stroke="#8A5A38"
          strokeWidth="2"
          filter="url(#ptShadowIcon)"
        >
          T
        </text>

        {/* Airplane Trail */}
        <path
          d="M 170 410 C 260 490, 410 460, 480 370 C 510 330, 520 280, 520 280"
          stroke="url(#ptNavyGradIcon)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Airplane Silhouette */}
        <g transform="translate(515, 275) rotate(35) scale(0.6)">
          <path
            d="M 0,-25 L 3,-7 L 22,5 L 22,10 L 3,5 L 3,18 L 10,24 L 10,27 L 0,23 L -10,27 L -10,24 L -3,18 L -3,5 L -22,10 L -22,5 L -3,-7 Z"
            fill="#0B1B3D"
          />
        </g>
      </svg>
    );
  }

  // Otherwise, return the full gorgeous circular logo matching the image exactly
  return (
    <svg
      width={finalSize}
      height={finalSize}
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      <defs>
        {/* Navy Blue Gradient with metallic look */}
        <linearGradient id="ptNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B1B3D" />
          <stop offset="30%" stopColor="#152B52" />
          <stop offset="55%" stopColor="#22426F" />
          <stop offset="80%" stopColor="#152B52" />
          <stop offset="100%" stopColor="#051026" />
        </linearGradient>

        {/* Metallic Rose Gold / Bronze Gradient */}
        <linearGradient id="ptGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9C6E48" />
          <stop offset="25%" stopColor="#D9B491" />
          <stop offset="50%" stopColor="#FCDEC3" />
          <stop offset="70%" stopColor="#C49A75" />
          <stop offset="100%" stopColor="#875630" />
        </linearGradient>

        {/* Soft shadow for depth */}
        <filter id="ptShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="3" dy="6" stdDeviation="6" floodOpacity="0.35" />
        </filter>
        
        {/* Glow effect */}
        <filter id="ptGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Optional Circular background - translucent or solid depending on the context */}
      <circle cx="500" cy="500" r="488" fill="transparent" />

      {/* Double Border Circular Frame */}
      {/* Outer thick dark blue circle */}
      <circle 
        cx="500" 
        cy="500" 
        r="470" 
        stroke="url(#ptNavyGrad)" 
        strokeWidth="13" 
        fill="none" 
      />
      
      {/* Inner thin dark blue circle */}
      <circle 
        cx="500" 
        cy="500" 
        r="452" 
        stroke="url(#ptNavyGrad)" 
        strokeWidth="3.2" 
        fill="none" 
      />

      {/* Gold/Bronze Crescent-like curve on the left */}
      <path
        d="M 390 220 
           C 210 250, 140 500, 260 680 
           C 360 810, 520 740, 520 740 
           C 520 740, 400 730, 320 620 
           C 250 520, 280 340, 390 220 Z"
        fill="url(#ptGoldGrad)"
        filter="url(#ptShadow)"
      />

      {/* Airplane Flight Trail */}
      <path
        d="M 290 620 
           C 410 740, 660 700, 770 550 
           C 820 480, 835 410, 835 410"
        stroke="url(#ptNavyGrad)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Airplane Silhouette */}
      <g transform="translate(830, 400) rotate(38) scale(0.95)" filter="url(#ptShadow)">
        <path
          d="M 0,-30 L 4,-8 L 26,6 L 26,12 L 4,6 L 4,22 L 12,28 L 12,32 L 0,27 L -12,32 L -12,28 L -4,22 L -4,6 L -26,12 L -26,6 L -4,-8 Z"
          fill="#0B1B3D"
        />
      </g>

      {/* Monogram P - Navy Blue Serif */}
      <text
        x="305"
        y="585"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontWeight="bold"
        fontSize="435"
        fill="url(#ptNavyGrad)"
        stroke="#18325C"
        strokeWidth="2.5"
        filter="url(#ptShadow)"
      >
        P
      </text>

      {/* Monogram T - Rose Gold/Bronze Serif */}
      <text
        x="455"
        y="665"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontWeight="bold"
        fontSize="390"
        fill="url(#ptGoldGrad)"
        stroke="#80512C"
        strokeWidth="2.5"
        filter="url(#ptShadow)"
      >
        T
      </text>

      {/* Brand Text "PAK-TAJARAT" */}
      {finalShowText && (
        <>
          <text
            x="500"
            y="782"
            fontFamily="'Georgia', 'Times New Roman', serif"
            fontWeight="bold"
            fontSize="68"
            fill="#0B1B3D"
            textAnchor="middle"
            letterSpacing="15"
          >
            {finalBrandText}
          </text>

          {/* Decorative Divider Line with Diamond Center */}
          {/* Tapering horizontal lines */}
          <path
            d="M 245 832 L 465 832 M 535 832 L 755 832"
            stroke="url(#ptGoldGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Elegant central diamond motif */}
          <polygon
            points="500,817 517,832 500,847 483,832"
            fill="url(#ptGoldGrad)"
            stroke="#9C6E48"
            strokeWidth="1"
          />
          {/* Little secondary decorative wings */}
          <path
            d="M 455 837 C 475 842, 485 842, 500, 847 C 515 842, 525 842, 545, 837"
            stroke="url(#ptGoldGrad)"
            strokeWidth="2"
            fill="none"
          />
        </>
      )}
    </svg>
  );
};
