import { useEffect, useState } from 'react';
import { getCharacter } from '../utils/character';
import { calculateRequiredXP } from '../types/character';
import CharacterAvatar from './CharacterAvatar';
import CharacterCustomization from './CharacterCustomization';
import type { Character, CharacterAppearance } from '../types/character';

interface CharacterWithAppearance extends Character {
  character_appearance: CharacterAppearance;
}

export default function CharacterDisplay() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [character, setCharacter] = useState<CharacterWithAppearance | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);

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

  const StatBox = ({ label, value }: { label: string; value: number }) => (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );

  if (showCustomization) {
    return (
      <CharacterCustomization
        characterId={character.id}
        currentAppearance={character.character_appearance}
        onCustomized={() => {
          loadCharacter();
          setShowCustomization(false);
        }}
        onCancel={() => setShowCustomization(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Character Avatar and Basic Info */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <CharacterAvatar
              hairStyle={character.character_appearance.hair_style}
              hairColor={character.character_appearance.hair_color}
              skinColor={character.character_appearance.skin_color}
              eyeColor={character.character_appearance.eye_color}
              outfit={character.character_appearance.outfit}
              size="lg"
              className="mb-4"
            />
            <button
              onClick={() => setShowCustomization(true)}
              className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Customize Character"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{character.name}</h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-lg text-gray-600">Level {character.level}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-lg text-gray-600 capitalize">{character.character_appearance.outfit}</span>
          </div>
        </div>

        {/* Character Stats */}
        <div className="space-y-6">
          {/* XP Progress */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Experience</span>
              <span>{character.experience} / {requiredXP} XP</span>
            </div>
            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${xpProgress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-25 animate-pulse"></div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.floor(requiredXP - character.experience)} XP until next level
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <StatBox label="Strength" value={character.strength} />
            <StatBox label="Agility" value={character.agility} />
            <StatBox label="Intelligence" value={character.intelligence} />
          </div>

          {/* Character Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Class</span>
              <span className="text-gray-900 capitalize">{character.character_appearance.outfit}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-900">
                {new Date(character.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Active</span>
              <span className="text-gray-900">
                {new Date(character.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="text-sm text-gray-500 bg-indigo-50 p-4 rounded-lg">
            <p className="font-medium text-indigo-700 mb-2">Level Up Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-indigo-600">
              <li>Complete daily habits to earn XP</li>
              <li>Achieve goals for bonus XP</li>
              <li>Maintain streaks for multipliers</li>
              <li>Unlock achievements for rewards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
