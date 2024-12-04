import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
      <div className="game-card h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  return (
    <div className={`character-card space-y-6 ${isPreview ? 'h-48' : 'h-[600px]'}`}>
      {!isPreview && (
        <div className="flex justify-between items-center">
          <h2 className="game-title text-xl">{character.name}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-white/80">Level</span>
            <div className="level-badge">{character.level}</div>
          </div>
        </div>
      )}

      <div className={`${isPreview ? 'h-full' : 'h-64'} bg-gradient-radial from-white/5 to-transparent rounded-lg`}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Character character={character} />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      {!isPreview && (
        <>
          {/* Experience Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Experience</span>
              <span className="text-game-exp">{character.experience} XP</span>
            </div>
            <div className="progress-bar exp-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${(character.experience % 100)}%` }}
              />
            </div>
          </div>

          {/* Attributes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Attributes</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(character.attributes).map(([attr, value]) => (
                <div key={attr} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-white/80">{attr}</span>
                    <span>{value}/10</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill bg-primary-500"
                      style={{ width: `${(value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Attributes */}
          {Object.keys(character.custom_attributes).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Custom Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(character.custom_attributes).map(([attr, value]) => (
                  <div key={attr} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-white/80">{attr}</span>
                      <span>{value}/10</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill bg-accent-500"
                        style={{ width: `${(value / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {character.appearance.achievements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Recent Achievements</h3>
              <div className="flex flex-wrap gap-2">
                {character.appearance.achievements.slice(-3).map((achievement, index) => (
                  <div
                    key={index}
                    className="achievement-badge"
                  >
                    {achievement}
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
