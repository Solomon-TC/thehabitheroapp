import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import type { FriendProfile, FriendRequest, FriendSuggestion } from '../types';
import FriendList from '../components/FriendList';
import FriendRequests from '../components/FriendRequests';
import FriendSuggestions from '../components/FriendSuggestions';

export default function Friends() {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch accepted friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          profiles:friend_id (
            id,
            email,
            characters (*)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      // Fetch pending requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      // Fetch friend suggestions
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .rpc('get_friend_suggestions', { user_id: user.id });

      if (suggestionsError) throw suggestionsError;

      setFriends(friendsData?.map(f => ({
        id: f.profiles.id,
        email: f.profiles.email,
        character: f.profiles.characters[0],
        recent_activities: []
      })) || []);
      
      setRequests(requestsData || []);
      setSuggestions(suggestionsData || []);
    } catch (error) {
      console.error('Error fetching friends data:', error);
      showNotification('Failed to load friends data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('friendships')
        .insert([{
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        }]);

      if (error) throw error;

      showNotification('Friend request sent!', 'success');
      fetchFriendsData();
    } catch (error) {
      console.error('Error sending friend request:', error);
      showNotification('Failed to send friend request', 'error');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      showNotification('Friend request accepted!', 'success');
      fetchFriendsData();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      showNotification('Failed to accept friend request', 'error');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      showNotification('Friend request rejected', 'info');
      fetchFriendsData();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      showNotification('Failed to reject friend request', 'error');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          characters (*)
        `)
        .ilike('email', `%${searchQuery}%`)
        .limit(5);

      if (error) throw error;

      setSuggestions(data?.map(profile => ({
        user_id: profile.id,
        email: profile.email,
        common_friends: 0,
        character: profile.characters[0]
      })) || []);
    } catch (error) {
      console.error('Error searching users:', error);
      showNotification('Failed to search users', 'error');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Search Bar */}
          <div className="game-card p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by email..."
                className="game-input flex-1"
              />
              <button
                onClick={handleSearch}
                className="game-button"
              >
                Search
              </button>
            </div>
          </div>

          {/* Friend Requests */}
          <FriendRequests
            requests={requests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />

          {/* Friend List */}
          <FriendList friends={friends} />

          {/* Friend Suggestions */}
          <FriendSuggestions
            suggestions={suggestions}
            onSendRequest={handleSendRequest}
          />
        </div>
      </div>
    </Layout>
  );
}
