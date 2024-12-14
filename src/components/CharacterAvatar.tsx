import { type HairStyle, type ShirtStyle, type PantsStyle, type ShoesStyle } from '../types/character';

interface CharacterAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  character?: {
    name: string;
  };
  // Appearance props
  hairStyle?: HairStyle;
  hairColor?: string;
  skinColor?: string;
  eyeColor?: string;
  shirtStyle?: ShirtStyle;
  shirtColor?: string;
  pantsStyle?: PantsStyle;
  pantsColor?: string;
  shoesStyle?: ShoesStyle;
  shoesColor?: string;
}

export default function CharacterAvatar({
  size = 'md',
  className = '',
  character,
  // Appearance props
  hairStyle,
  hairColor,
  skinColor,
  eyeColor,
  shirtStyle,
  shirtColor,
  pantsStyle,
  pantsColor,
  shoesStyle,
  shoesColor
}: CharacterAvatarProps) {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  // For now, just showing a simple avatar with initials or customization preview
  // TODO: Implement actual character avatar visualization with appearance properties
  return (
    <div 
      className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center`}
      style={{ 
        backgroundColor: skinColor || '#E0AC69',
        border: `2px solid ${hairColor || '#2C222B'}`
      }}
    >
      <span className="font-medium" style={{ color: eyeColor || '#1B4B36' }}>
        {character ? character.name.charAt(0).toUpperCase() : 'C'}
      </span>
    </div>
  );
}
