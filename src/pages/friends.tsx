import { useState } from 'react';
import { createClient } from '../lib/supabase';
import { FriendsList } from '../components/FriendsList';
import FriendRequests from '../components/FriendRequests';
import AuthWrapper from '../components/AuthWrapper';

function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const supabase = createClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          characters!inner (
            id,
            name,
            level,
            character_appearance:character_appearances(*)
          )
        `)
        .ilike('username', `%${searchQuery}%`)
        .neq('id', (await supabase.auth.getUser()).data.user?.id)
        .limit(5);

      if (error) throw error;
      setSearchResults(users || []);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          receiver_id: userId
        });

      if (error) throw error;

      // Remove user from search results
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-pixel text-rpg-primary mb-8">Friends</h1>

      {/* Search Section */}
      <div className="rpg-panel mb-8">
        <h2 className="text-xl font-pixel text-rpg-light mb-4">Find Friends</h2>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="flex-1 rpg-input"
          />
          <button
            type="submit"
            className="rpg-button-primary"
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-4">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rpg-panel-secondary">
                <div>
                  <div className="text-rpg-light font-semibold">{user.username}</div>
                  <div className="text-rpg-light-darker text-sm">
                    Level {user.characters[0].level} {user.characters[0].name}
                  </div>
                </div>
                <button
                  onClick={() => sendFriendRequest(user.id)}
                  className="rpg-button-secondary"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friend Requests Section */}
      <div className="rpg-panel mb-8">
        <h2 className="text-xl font-pixel text-rpg-light mb-4">Friend Requests</h2>
        <FriendRequests />
      </div>

      {/* Friends List Section */}
      <div className="rpg-panel">
        <h2 className="text-xl font-pixel text-rpg-light mb-4">Your Friends</h2>
        <FriendsList />
      </div>
    </div>
  );
}

export default function FriendsPageWrapper() {
  return (
    <AuthWrapper>
      <FriendsPage />
    </AuthWrapper>
  );
}
