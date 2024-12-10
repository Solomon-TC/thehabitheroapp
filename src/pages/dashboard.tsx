import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '../components/Header';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome back, {userName}!
            </h2>
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500">Your habits and goals will appear here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
