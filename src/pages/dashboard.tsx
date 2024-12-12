import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '../components/Header';
import HabitList from '../components/HabitList';
import GoalList from '../components/GoalList';
import AddHabitForm from '../components/AddHabitForm';
import AddGoalForm from '../components/AddGoalForm';

type Tab = 'habits' | 'goals';

const CloseIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('habits');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.email?.split('@')[0] || 'User');
      }
      setLoading(false);
    };

    getUser();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 sm:px-0 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userName}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your habits and achieve your goals.
          </p>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-0">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as Tab)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="habits">Habits</option>
              <option value="goals">Goals</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('habits')}
                  className={`${
                    activeTab === 'habits'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                >
                  Habits
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`${
                    activeTab === 'goals'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                >
                  Goals
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            {activeTab === 'habits' ? (
              <HabitList onAddHabit={() => setShowAddHabit(true)} />
            ) : (
              <GoalList onAddGoal={() => setShowAddGoal(true)} />
            )}
          </div>
        </div>
      </main>

      {/* Add Habit Modal */}
      {showAddHabit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg max-w-md w-full">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={() => setShowAddHabit(false)}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <CloseIcon />
              </button>
            </div>
            <AddHabitForm
              onHabitAdded={() => {
                setShowAddHabit(false);
              }}
              onCancel={() => setShowAddHabit(false)}
            />
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg max-w-md w-full">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={() => setShowAddGoal(false)}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <CloseIcon />
              </button>
            </div>
            <AddGoalForm
              onGoalAdded={() => {
                setShowAddGoal(false);
              }}
              onCancel={() => setShowAddGoal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
