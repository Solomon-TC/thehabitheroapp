import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '../components/Header';
import HabitList from '../components/HabitList';
import AddHabitForm from '../components/AddHabitForm';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);
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

        {/* Main Content */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            <HabitList onAddHabit={() => setShowAddHabit(true)} />
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
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
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
    </div>
  );
}
