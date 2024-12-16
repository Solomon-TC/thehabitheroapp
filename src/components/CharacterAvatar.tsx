import React from 'react';
import { AppearanceInput } from '../types/character';

export interface CharacterAvatarProps {
  appearance: AppearanceInput;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export default function CharacterAvatar({ appearance, size = 'md', className = '' }: CharacterAvatarProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div 
      className={`relative rounded-full ${sizeClass} ${className}`}
      style={{ backgroundColor: appearance.skin_color }}
    >
      {/* Hair */}
      <div 
        className="absolute inset-0 rounded-full opacity-90"
        style={{ 
          backgroundColor: appearance.hair_color,
          clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'
        }}
      />
      
      {/* Eyes */}
      <div className="absolute w-full h-full flex justify-center items-center">
        <div className="flex space-x-1">
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: appearance.eye_color }}
          />
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: appearance.eye_color }}
          />
        </div>
      </div>

      {/* Outfit */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-full"
        style={{ backgroundColor: appearance.outfit_color }}
      />
    </div>
  );
}
