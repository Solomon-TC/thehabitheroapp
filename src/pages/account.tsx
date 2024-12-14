import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getCharacter } from '../utils/character';
import CharacterCustomization from '../components/CharacterCustomization';
import type { Character, CharacterAppearance } from '../types/character';

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [character, setCharacter] = useState<Character & { character_appearance: CharacterAppearance }>();
  const [showCustomization, setShowCustomization] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get user email
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }

      // Get character data
      const characterData = await getCharacter();
      setCharacter(characterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email!,
        { redirectTo: `${window.location.origin}/auth/callback` }
      );
      if (resetError) throw resetError;
      alert('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (showCustomization && character) {
    return (
      <CharacterCustomization
        characterId={character.id}
        currentAppearance={character.character_appearance}
        onCustomized={() => {
          setShowCustomization(false);
          loadData();
        }}
        onCancel={() => setShowCustomization(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account and character preferences</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Account Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
            <div className="mt-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 text-sm text-gray-900">{email}</div>
              </div>

              <div>
                <button
                  onClick={handlePasswordReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Character Section */}
        {character && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Character Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Customize your character's appearance and view stats
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomization(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Customize Character
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Character Name</h3>
                  <p className="mt-1 text-sm text-gray-900">{character.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Level</h3>
                  <p className="mt-1 text-sm text-gray-900">{character.level}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                  <p className="mt-1 text-sm text-gray-900">{character.experience} XP</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(character.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-red-600">Danger Zone</h2>
            <div className="mt-4">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // TODO: Implement account deletion
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
