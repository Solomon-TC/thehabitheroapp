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
      <div className="flex justify-center items-center min-h-screen bg-rpg-dark">
        <div className="animate-spin-slow text-rpg-primary">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-rpg-dark">
        <div className="text-red-500 font-pixel text-center p-4 rpg-panel animate-shake">
          {error || 'Failed to load quest log'}
          <button 
            onClick={loadCharacter}
            className="mt-4 rpg-button text-sm"
          >
            Retry Quest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rpg-dark-darker to-rpg-dark p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Character Section */}
        <div className="rpg-panel animate-fade-in">
          <CharacterDisplay character={character} onUpdate={loadCharacter} />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-container animate-float">
            <div className="text-center">
              <div className="text-2xl font-pixel text-rpg-primary">Level {character.level}</div>
              <div className="text-sm text-rpg-light-darker mt-1">{character.experience} XP</div>
            </div>
          </div>
          
          <div className="stat-container animate-float delay-100">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="stat-item">
                <span className="text-rarity-rare">STR</span>
                <span className="text-xl">{character.strength}</span>
              </div>
              <div className="stat-item">
                <span className="text-rarity-epic">AGI</span>
                <span className="text-xl">{character.agility}</span>
              </div>
              <div className="stat-item">
                <span className="text-rarity-legendary">INT</span>
                <span className="text-xl">{character.intelligence}</span>
              </div>
            </div>
          </div>

          <div className="stat-container animate-float delay-200">
            <div className="text-center">
              <div className="text-sm text-rpg-light-darker">Journey Started</div>
              <div className="text-rpg-light mt-1">
                {new Date(character.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Quests Section */}
        <div className="rpg-panel">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-pixel text-rpg-primary">Daily Quests</h2>
            <button
              onClick={() => setShowAddHabit(true)}
              className="rpg-button"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Quest
              </span>
            </button>
          </div>

          {showAddHabit && (
            <div className="mb-6 rpg-border p-4 animate-achievement">
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

        {/* Epic Quests Section */}
        <div className="rpg-panel">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-pixel text-rpg-secondary">Epic Quests</h2>
            <button
              onClick={() => setShowAddGoal(true)}
              className="rpg-button"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Epic Quest
              </span>
            </button>
          </div>

          {showAddGoal && (
            <div className="mb-6 rpg-border p-4 animate-achievement">
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
      </div>
    </div>
  );
}
