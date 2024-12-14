import { useState, useEffect } from 'react';
import { getCharacter } from '../utils/character';
import CharacterDisplay from '../components/CharacterDisplay';
import HabitList from '../components/HabitList';
import GoalList from '../components/GoalList';
import AddHabitForm from '../components/AddHabitForm';
import AddGoalForm from '../components/AddGoalForm';
import type { Character } from '../types/character';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

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
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="text-red-600 text-center py-4">
        {error || 'Failed to load dashboard'}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Character Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <CharacterDisplay character={character} onUpdate={loadCharacter} />
        </div>

        {/* Habits Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Daily Quests</h2>
            <button
              onClick={() => setShowAddHabit(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Daily Quest
            </button>
          </div>

          {showAddHabit && (
            <div className="mb-6">
              <AddHabitForm
                onHabitAdded={() => {
                  setShowAddHabit(false);
                  loadCharacter();
                }}
                onCancel={() => setShowAddHabit(false)}
              />
            </div>
          )}

          <HabitList onHabitCompleted={loadCharacter} />
        </div>

        {/* Goals Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Epic Quests</h2>
            <button
              onClick={() => setShowAddGoal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Epic Quest
            </button>
          </div>

          {showAddGoal && (
            <div className="mb-6">
              <AddGoalForm
                onGoalAdded={() => {
                  setShowAddGoal(false);
                  loadCharacter();
                }}
                onCancel={() => setShowAddGoal(false)}
              />
            </div>
          )}

          <GoalList onGoalUpdated={loadCharacter} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Level</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {character.level}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {character.experience} XP
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Stats</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Strength</span>
                <span className="text-gray-900">{character.strength}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Agility</span>
                <span className="text-gray-900">{character.agility}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Intelligence</span>
                <span className="text-gray-900">{character.intelligence}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Journey Started</div>
            <div className="mt-1 text-gray-900">
              {new Date(character.created_at).toLocaleDateString()}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Keep up the great work!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
