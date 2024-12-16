import { useEffect, useState } from 'react';
import { getCharacter, getCharacterStats, calculateRequiredXP } from '../utils/character';
import type { Stats } from '../types/database';
import type { Character } from '../types/character';

export default function ProgressReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const characterData = await getCharacter();
      setCharacter(characterData);
      
      const statsData = await getCharacterStats(characterData.id);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rpg-primary"></div>
      </div>
    );
  }

  if (error || !character || !stats) {
    return (
      <div className="text-red-500 text-center py-4">
        {error || 'Failed to load progress report'}
      </div>
    );
  }

  const nextLevelXP = calculateRequiredXP(character.level + 1);
  const currentLevelXP = calculateRequiredXP(character.level);
  const progressToNextLevel = ((character.experience - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-pixel text-rpg-primary mb-8">Adventure Progress</h1>

      {/* Character Overview */}
      <div className="rpg-panel mb-8">
        <h2 className="text-2xl font-pixel text-rpg-light mb-4">{character.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-rpg-light-darker">Level</div>
            <div className="text-2xl font-semibold text-rpg-light">{character.level}</div>
          </div>
          <div>
            <div className="text-sm text-rpg-light-darker">Experience</div>
            <div className="text-2xl font-semibold text-rpg-light">{character.experience} XP</div>
          </div>
          <div>
            <div className="text-sm text-rpg-light-darker">Next Level</div>
            <div className="text-2xl font-semibold text-rpg-light">{nextLevelXP} XP</div>
          </div>
          <div>
            <div className="text-sm text-rpg-light-darker">Progress</div>
            <div className="text-2xl font-semibold text-rpg-light">{Math.round(progressToNextLevel)}%</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Character Stats */}
        <div className="rpg-panel">
          <h3 className="text-xl font-pixel text-rpg-light mb-4">Character Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-rpg-light-darker">Strength</span>
                <span className="text-sm text-rpg-light">{character.strength}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-rarity-rare"
                  style={{ width: `${(character.strength / 20) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-rpg-light-darker">Agility</span>
                <span className="text-sm text-rpg-light">{character.agility}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-rarity-epic"
                  style={{ width: `${(character.agility / 20) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-rpg-light-darker">Intelligence</span>
                <span className="text-sm text-rpg-light">{character.intelligence}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-rarity-legendary"
                  style={{ width: `${(character.intelligence / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Stats */}
        <div className="rpg-panel">
          <h3 className="text-xl font-pixel text-rpg-light mb-4">Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-rpg-light-darker">Daily Quests</div>
              <div className="text-2xl font-semibold text-rpg-light">{stats.habits_completed}</div>
            </div>
            <div>
              <div className="text-sm text-rpg-light-darker">Epic Quests</div>
              <div className="text-2xl font-semibold text-rpg-light">{stats.goals_completed}</div>
            </div>
            <div>
              <div className="text-sm text-rpg-light-darker">Best Streak</div>
              <div className="text-2xl font-semibold text-rpg-light">{stats.max_streak} days</div>
            </div>
            <div>
              <div className="text-sm text-rpg-light-darker">Achievements</div>
              <div className="text-2xl font-semibold text-rpg-light">{stats.achievements_unlocked}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="rpg-panel">
        <h3 className="text-xl font-pixel text-rpg-light mb-4">Level Progress</h3>
        <div className="space-y-2">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-rpg-light-darker">
            <span>Level {character.level}</span>
            <span>{Math.round(progressToNextLevel)}%</span>
            <span>Level {character.level + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
