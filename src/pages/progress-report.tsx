import { useEffect, useState } from 'react';
import { getCharacter, getCharacterStats } from '../utils/character';
import { calculateRequiredXP } from '../types/character';
import type { Stats } from '../types/database';

export default function ProgressReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const character = await getCharacter();
      const statsData = await getCharacterStats(character.id);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-red-600 text-center py-4">
        {error || 'Failed to load progress report'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress Report</h1>
        <p className="mt-2 text-gray-600">Track your journey to better habits</p>
      </div>

      {/* Character Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Character Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Level</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.character.level}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Experience</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.total_experience} XP
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Achievements</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.achievements_earned}
            </div>
          </div>
        </div>
      </div>

      {/* Habit Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Habit Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Habits Completed</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.habits_completed}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Current Streak</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.streak_days} days
            </div>
          </div>
        </div>
      </div>

      {/* Goal Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Goal Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Goals Completed</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.goals_completed}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Active Goals</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.total_goals - stats.goals_completed}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
