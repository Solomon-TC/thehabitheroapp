import React from 'react';

interface CharacterAvatarProps {
  hairStyle: string;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  outfit: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getOutfitColor = (outfit: string) => {
  switch (outfit) {
    case 'warrior':
      return {
        primary: '#8B4513',
        secondary: '#A0522D',
        accent: '#CD853F'
      };
    case 'mage':
      return {
        primary: '#4B0082',
        secondary: '#663399',
        accent: '#9370DB'
      };
    case 'rogue':
      return {
        primary: '#2F4F4F',
        secondary: '#3D5E5E',
        accent: '#4A6F6F'
      };
    case 'noble':
      return {
        primary: '#800020',
        secondary: '#8B0000',
        accent: '#DC143C'
      };
    case 'explorer':
      return {
        primary: '#556B2F',
        secondary: '#6B8E23',
        accent: '#9ACD32'
      };
    default:
      return {
        primary: '#696969',
        secondary: '#808080',
        accent: '#A9A9A9'
      };
  }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        container: 'w-24 h-24',
        head: 'w-16 h-16',
        hair: 'w-20 h-20 -top-2',
        eyes: 'w-2 h-2 top-6',
        leftEye: 'left-4',
        rightEye: 'left-10',
        outfit: 'h-12'
      };
    case 'lg':
      return {
        container: 'w-48 h-48',
        head: 'w-32 h-32',
        hair: 'w-40 h-40 -top-4',
        eyes: 'w-4 h-4 top-12',
        leftEye: 'left-8',
        rightEye: 'left-20',
        outfit: 'h-24'
      };
    default: // md
      return {
        container: 'w-32 h-32',
        head: 'w-24 h-24',
        hair: 'w-28 h-28 -top-3',
        eyes: 'w-3 h-3 top-8',
        leftEye: 'left-6',
        rightEye: 'left-15',
        outfit: 'h-16'
      };
  }
};

const getHairStyles = (style: string): React.CSSProperties => {
  switch (style) {
    case 'spiky':
      return {
        clipPath: 'polygon(0 100%, 20% 60%, 40% 90%, 60% 60%, 80% 90%, 100% 60%, 100% 100%)',
        borderRadius: '50% 50% 0 0'
      };
    case 'curly':
      return {
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        transform: 'scale(1.1)'
      };
    case 'long':
      return {
        height: '150%',
        borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%'
      };
    default: // short
      return {
        borderRadius: '50%',
        transform: 'scale(0.9)'
      };
  }
};

export default function CharacterAvatar({
  hairStyle,
  hairColor,
  skinColor,
  eyeColor,
  outfit,
  size = 'md',
  className = ''
}: CharacterAvatarProps) {
  const sizeClasses = getSizeClasses(size);
  const outfitColors = getOutfitColor(outfit);
  const hairStyles = getHairStyles(hairStyle);

  return (
    <div className={`relative ${sizeClasses.container} ${className}`}>
      {/* Character Container */}
      <div className="relative w-full h-full bg-white rounded-lg shadow-inner flex items-center justify-center">
        <div className="relative">
          {/* Head */}
          <div
            className={`${sizeClasses.head} rounded-full relative`}
            style={{ backgroundColor: skinColor }}
          >
            {/* Hair */}
            <div
              className={`absolute ${sizeClasses.hair} left-1/2 transform -translate-x-1/2`}
              style={{
                backgroundColor: hairColor,
                ...hairStyles
              }}
            />
            
            {/* Eyes */}
            <div
              className={`absolute ${sizeClasses.eyes} ${sizeClasses.leftEye} rounded-full`}
              style={{ backgroundColor: eyeColor }}
            />
            <div
              className={`absolute ${sizeClasses.eyes} ${sizeClasses.rightEye} rounded-full`}
              style={{ backgroundColor: eyeColor }}
            />

            {/* Expression - slight smile */}
            <div
              className="absolute left-1/2 transform -translate-x-1/2 w-8 h-4"
              style={{
                top: '65%',
                borderRadius: '0 0 100px 100px',
                border: '2px solid rgba(0,0,0,0.2)',
                borderTop: 'none'
              }}
            />
          </div>

          {/* Outfit */}
          <div
            className={`absolute bottom-0 left-0 right-0 ${sizeClasses.outfit} rounded-lg`}
            style={{
              background: `linear-gradient(135deg, ${outfitColors.primary} 0%, ${outfitColors.secondary} 50%, ${outfitColors.accent} 100%)`
            }}
          >
            {/* Outfit details */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 20%),
                  radial-gradient(circle at 70% 20%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 20%)
                `
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
