import { useState } from 'react';
import AuthWrapper from '../components/AuthWrapper';
import HabitList from '../components/HabitList';
import GoalList from '../components/GoalList';
import AddHabitForm from '../components/AddHabitForm';
import AddGoalForm from '../components/AddGoalForm';
import type { Habit, Goal } from '../types/database';

function ManagePage() {
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
      <h1 className="text-3xl font-pixel text-rpg-primary mb-8">Manage Your Quests</h1>

      {/* Daily Quests (Habits) Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-pixel text-rpg-light">Daily Quests</h2>
          {!showHabitForm && (
            <button
              onClick={() => setShowHabitForm(true)}
              className="rpg-button-primary"
            >
              Add Daily Quest
            </button>
          )}
        </div>

        {showHabitForm ? (
          <div className="rpg-panel mb-6">
            <h2 className="text-xl font-pixel text-rpg-light mb-4">Add New Daily Quest</h2>
            <AddHabitForm
              onHabitAdded={handleHabitAdded}
              onCancel={() => setShowHabitForm(false)}
            />
          </div>
        ) : (
          <HabitList habits={habits} setHabits={setHabits} />
        )}
      </div>

      {/* Long-term Quests (Goals) Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-pixel text-rpg-light">Long-term Quests</h2>
          {!showGoalForm && (
            <button
              onClick={() => setShowGoalForm(true)}
              className="rpg-button-primary"
            >
              Add Long-term Quest
            </button>
          )}
        </div>

        {showGoalForm ? (
          <div className="rpg-panel mb-6">
            <h2 className="text-xl font-pixel text-rpg-light mb-4">Add New Long-term Quest</h2>
            <AddGoalForm
              onGoalAdded={handleGoalAdded}
              onCancel={() => setShowGoalForm(false)}
            />
          </div>
        ) : (
          <GoalList goals={goals} setGoals={setGoals} />
        )}
      </div>
    </div>
  );
}

export default function Manage() {
  return (
    <AuthWrapper>
      <ManagePage />
    </AuthWrapper>
  );
}
