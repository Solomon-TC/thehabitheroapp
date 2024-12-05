import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Character from './Character';
import type { Character as CharacterType } from '../types';

interface CharacterDisplayProps {
  character: CharacterType;
  isPreview?: boolean;
}

export default function CharacterDisplay({ character, isPreview = false }: CharacterDisplayProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (character) {
      setLoading(false);
    }
  }, [character]);

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  return (
    <div className={`space-y-6 ${isPreview ? 'h-48' : 'h-auto'}`}>
      {!isPreview && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{character.name}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Level</span>
            <div className="px-2 py-1 bg-blue-500 text-white rounded-md">{character.level}</div>
          </div>
        </div>
      )}

      <div className={`${isPreview ? 'h-full' : 'h-64'} bg-gradient-to-b from-gray-50 to-white rounded-lg p-4`}>
        <Character character={character} />
      </div>

      {!isPreview && (
        <>
          {/* Experience Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Experience</span>
              <span className="text-blue-600">{character.experience} XP</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(character.experience % 100)}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(character.stats).map(([stat, value]) => (
                <div key={stat} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-gray-600">{stat}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${(value / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          {character.achievements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Recent Achievements</h3>
              <div className="flex flex-wrap gap-2">
                {character.achievements.slice(-3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {achievement.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
