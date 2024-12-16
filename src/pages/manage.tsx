import { useState } from 'react';
import AuthWrapper from '../components/AuthWrapper';
import AddHabitForm from '../components/AddHabitForm';
import AddGoalForm from '../components/AddGoalForm';
import HabitList from '../components/HabitList';
import GoalList from '../components/GoalList';
import { Habit, Goal } from '../types/database';

function ManagePage() {
  const [activeTab, setActiveTab] = useState<'habits' | 'goals'>('habits');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const handleHabitAdded = (habit: Habit) => {
    setHabits(prev => [...prev, habit]);
    setShowHabitForm(false);
  };

  const handleGoalAdded = (goal: Goal) => {
    setGoals(prev => [...prev, goal]);
    setShowGoalForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-pixel text-rpg-primary mb-8">Manage Your Quest Log</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('habits')}
          className={`rpg-tab ${activeTab === 'habits' ? 'active' : ''}`}
        >
          Daily Quests
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`rpg-tab ${activeTab === 'goals' ? 'active' : ''}`}
        >
          Epic Quests
        </button>
      </div>

      {/* Habits Section */}
      {activeTab === 'habits' && (
        <div className="space-y-8">
          {!showHabitForm ? (
            <div className="rpg-panel">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-pixel text-rpg-light">Daily Quests</h2>
                <button
                  onClick={() => setShowHabitForm(true)}
                  className="rpg-button-primary"
                >
                  Add New Quest
                </button>
              </div>
              <HabitList onUpdate={setHabits} />
            </div>
          ) : (
            <div className="rpg-panel">
              <h2 className="text-xl font-pixel text-rpg-light mb-4">Add New Daily Quest</h2>
              <AddHabitForm
                onHabitAdded={handleHabitAdded}
                onCancel={() => setShowHabitForm(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* Goals Section */}
      {activeTab === 'goals' && (
        <div className="space-y-8">
          {!showGoalForm ? (
            <div className="rpg-panel">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-pixel text-rpg-light">Epic Quests</h2>
                <button
                  onClick={() => setShowGoalForm(true)}
                  className="rpg-button-primary"
                >
                  Add New Quest
                </button>
              </div>
              <GoalList onUpdate={setGoals} />
            </div>
          ) : (
            <div className="rpg-panel">
              <h2 className="text-xl font-pixel text-rpg-light mb-4">Add New Epic Quest</h2>
              <AddGoalForm
                onGoalAdded={handleGoalAdded}
                onCancel={() => setShowGoalForm(false)}
              />
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .rpg-tab {
          @apply px-6 py-3 text-rpg-light-darker font-pixel rounded-t-lg transition-colors duration-200;
        }
        .rpg-tab.active {
          @apply bg-rpg-dark-lighter text-rpg-primary border-b-2 border-rpg-primary;
        }
        .rpg-tab:hover:not(.active) {
          @apply text-rpg-light bg-rpg-dark-lighter;
        }
      `}</style>
    </div>
  );
}

export default function ManagePageWrapper() {
  return (
    <AuthWrapper>
      <ManagePage />
    </AuthWrapper>
  );
}
