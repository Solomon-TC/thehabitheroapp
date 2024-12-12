import { useEffect, useState } from 'react';
import { getCharacter } from '../utils/character';
import { calculateRequiredXP } from '../types/character';
import type { Character, CharacterAppearance } from '../types/character';

interface CharacterWithAppearance extends Character {
  character_appearance: CharacterAppearance;
}

export default function CharacterDisplay() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [character, setCharacter] = useState<CharacterWithAppearance | null>(null);

  useEffect(() => {
    loadCharacter();
  }, []);

  const loadCharacter = async () => {
    try {
      const data = await getCharacter();
      setCharacter(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        {error}
      </div>
    );
  }

  if (!character) {
    return null;
  }

  const requiredXP = calculateRequiredXP(character.level);
  const xpProgress = (character.experience / requiredXP) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Character Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 bg-gray-50 rounded-lg shadow-inner mb-4 flex items-center justify-center">
            <div className="relative">
              {/* Basic 2D character representation */}
              <div 
                className="w-32 h-32 rounded-full"
                style={{ backgroundColor: character.character_appearance.skin_color }}
              >
                <div 
                  className="absolute w-24 h-24 top-[-12px] left-4 rounded-full"
                  style={{ backgroundColor: character.character_appearance.hair_color }}
                />
                <div 
                  className="absolute w-4 h-4 top-12 left-8 rounded-full" 
                  style={{ backgroundColor: character.character_appearance.eye_color }}
                />
                <div 
                  className="absolute w-4 h-4 top-12 left-20 rounded-full" 
                  style={{ backgroundColor: character.character_appearance.eye_color }}
                />
              </div>
              <div 
                className="absolute bottom-0 left-0 right-0 h-16 rounded-lg"
                style={{ 
                  backgroundColor: character.character_appearance.outfit === 'warrior' ? '#8B4513' : 
                                character.character_appearance.outfit === 'mage' ? '#4B0082' :
                                character.character_appearance.outfit === 'rogue' ? '#2F4F4F' :
                                character.character_appearance.outfit === 'noble' ? '#800020' :
                                character.character_appearance.outfit === 'explorer' ? '#556B2F' : '#696969'
                }}
              />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{character.name}</h2>
          <p className="text-gray-500">Level {character.level}</p>
        </div>

        {/* Character Stats */}
        <div className="space-y-4">
          {/* XP Progress */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Experience</span>
              <span>{character.experience} / {requiredXP} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Strength</div>
              <div className="text-xl font-bold text-gray-900">{character.strength}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Agility</div>
              <div className="text-xl font-bold text-gray-900">{character.agility}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Intelligence</div>
              <div className="text-xl font-bold text-gray-900">{character.intelligence}</div>
            </div>
          </div>

          {/* Character Details */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Class</span>
              <span className="text-gray-900 capitalize">{character.character_appearance.outfit}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Hair Style</span>
              <span className="text-gray-900 capitalize">{character.character_appearance.hair_style}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-900">
                {new Date(character.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
