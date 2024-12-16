import { useState } from 'react';
import CharacterAvatar from './CharacterAvatar';
import CharacterCustomization from './CharacterCustomization';
import { calculateRequiredXP } from '../utils/character';
import type { 
  Character,
  HairStyle,
  ShirtStyle,
  PantsStyle,
  ShoesStyle
} from '../types/character';

interface CharacterDisplayProps {
  character: Character;
  onUpdate: () => void;
}

export default function CharacterDisplay({ character, onUpdate }: CharacterDisplayProps) {
  const [showCustomization, setShowCustomization] = useState(false);

  const calculateLevelProgress = () => {
    const currentExp = character.experience;
    const nextLevelExp = calculateRequiredXP(character.level + 1);
    const prevLevelExp = calculateRequiredXP(character.level);
    const progress = ((currentExp - prevLevelExp) / (nextLevelExp - prevLevelExp)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (showCustomization) {
    return (
      <CharacterCustomization
        characterId={character.id}
        currentAppearance={character.character_appearance}
        onCustomized={() => {
          setShowCustomization(false);
          onUpdate();
        }}
        onCancel={() => setShowCustomization(false)}
      />
    );
  }

  return (
    <div className="p-6 rpg-panel">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-6">
          <div className="relative flex-shrink-0 animate-float">
            {/* Level Badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-rarity-epic to-rarity-legendary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-rpg z-10">
              {character.level}
            </div>
            
            <div className="rpg-border p-2 bg-rpg-dark-lighter rounded-lg shadow-rpg">
              <CharacterAvatar
                character={character}
                size="lg"
                hairStyle={character.character_appearance.hair_style as HairStyle}
                hairColor={character.character_appearance.hair_color}
                skinColor={character.character_appearance.skin_color}
                eyeColor={character.character_appearance.eye_color}
                shirtStyle={character.character_appearance.shirt_style as ShirtStyle}
                shirtColor={character.character_appearance.shirt_color}
                pantsStyle={character.character_appearance.pants_style as PantsStyle}
                pantsColor={character.character_appearance.pants_color}
                shoesStyle={character.character_appearance.shoes_style as ShoesStyle}
                shoesColor={character.character_appearance.shoes_color}
              />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-pixel text-rpg-primary">{character.name}</h1>
            <div className="mt-1 text-sm text-rpg-light-darker font-medium">Level {character.level} Adventurer</div>
            
            {/* XP Progress */}
            <div className="mt-4 w-64">
              <div className="flex justify-between text-sm">
                <span className="text-rpg-light">Experience</span>
                <span className="text-rpg-light">{character.experience} XP</span>
              </div>
              <div className="mt-1 relative w-full h-2 bg-rpg-dark-lighter rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-rpg-primary to-rpg-secondary transition-all duration-300"
                  style={{ width: `${calculateLevelProgress()}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-rpg-light-darker text-right">
                {Math.round(calculateLevelProgress())}% to next level
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCustomization(true)}
          className="rpg-button"
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Customize
          </span>
        </button>
      </div>

      {/* Character Stats */}
      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="stat-container animate-float delay-100">
          <div className="text-sm font-medium text-rarity-rare">Strength</div>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-rpg-light">{character.strength}</div>
            <div className="ml-2 text-sm text-rpg-light-darker">Physical power</div>
          </div>
        </div>

        <div className="stat-container animate-float delay-200">
          <div className="text-sm font-medium text-rarity-epic">Agility</div>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-rpg-light">{character.agility}</div>
            <div className="ml-2 text-sm text-rpg-light-darker">Speed & reflexes</div>
          </div>
        </div>

        <div className="stat-container animate-float delay-300">
          <div className="text-sm font-medium text-rarity-legendary">Intelligence</div>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-rpg-light">{character.intelligence}</div>
            <div className="ml-2 text-sm text-rpg-light-darker">Mental acuity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
