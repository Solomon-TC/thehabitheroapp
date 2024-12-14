import { useState } from 'react';
import CharacterAvatar from './CharacterAvatar';
import CharacterCustomization from './CharacterCustomization';
import { calculateRequiredXP } from '../types/character';
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
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{character.name}</h1>
            <div className="mt-1 text-sm text-gray-500">Level {character.level}</div>
            <div className="mt-4 w-64">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Experience</span>
                <span>{character.experience} XP</span>
              </div>
              <div className="mt-1 relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${calculateLevelProgress()}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-400 text-right">
                {Math.round(calculateLevelProgress())}% to next level
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCustomization(true)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Customize
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <div>
          <div className="text-sm font-medium text-gray-500">Strength</div>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{character.strength}</div>
            <div className="ml-2 text-sm text-gray-500">Physical power</div>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Agility</div>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{character.agility}</div>
            <div className="ml-2 text-sm text-gray-500">Speed & reflexes</div>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Intelligence</div>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{character.intelligence}</div>
            <div className="ml-2 text-sm text-gray-500">Mental acuity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
