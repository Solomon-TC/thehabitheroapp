import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setEmail(user?.email || '');
      setLoading(false);
    };
    getUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', content: '' });

    try {
      const { error } = await supabase.auth.updateUser({ email });

      if (error) throw error;

      setMessage({ type: 'success', content: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', content: error.message });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {message.content && (
            <div
              className={`p-4 rounded-md ${
                message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}
            >
              {message.content}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h2>
          <button
            onClick={async () => {
              const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
              if (confirmed) {
                try {
                  const { error } = await supabase.auth.signOut();
                  if (error) throw error;
                  // Additional cleanup like deleting user data could be done here
                } catch (error) {
                  console.error('Error deleting account:', error);
                }
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Delete Account
          </button>
        </div>
      </div>
    </Layout>
  );
}
