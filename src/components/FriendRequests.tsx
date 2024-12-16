import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';
import CharacterAvatar from './CharacterAvatar';
import { AppearanceInput } from '../types/character';

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    username: string;
    character: {
      id: string;
      name: string;
      level: number;
      character_appearance: AppearanceInput;
    };
  };
  created_at: string;
}

export default function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadFriendRequests();
  }, []);

  const loadFriendRequests = async () => {
    try {
      setLoading(true);
      setError('');

      // First get the pending requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('friend_requests')
        .select('id, sender_id, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Then get the details for each sender
      const requestPromises = requestsData.map(async (request) => {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', request.sender_id)
          .single();

        if (userError) throw userError;

        const { data: characterData, error: characterError } = await supabase
          .from('characters')
          .select(`
            id,
            name,
            level,
            character_appearance:character_appearances (
              skin_color,
              hair_color,
              eye_color,
              outfit_color
            )
          `)
          .eq('user_id', request.sender_id)
          .single();

        if (characterError) throw characterError;

        return {
          id: request.id,
          created_at: request.created_at,
          sender: {
            id: userData.id,
            username: userData.username,
            character: characterData
          }
        };
      });

      const fullRequests = await Promise.all(requestPromises);
      setRequests(fullRequests);
    } catch (err) {
      setError('Failed to load friend requests');
      console.error('Error loading friend requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase.rpc('handle_friend_request', {
        request_id: requestId,
        new_status: accept ? 'accepted' : 'rejected'
      });

      if (error) throw error;

      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      console.error('Error handling friend request:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rpg-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-rpg-light text-center py-4">
        No pending friend requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="rpg-panel-secondary p-4">
          <div className="flex items-center space-x-4">
            <CharacterAvatar
              appearance={request.sender.character.character_appearance}
              size="md"
            />
            <div className="flex-1">
              <div className="text-rpg-light font-semibold">
                {request.sender.username}
              </div>
              <div className="text-rpg-light-darker text-sm">
                Level {request.sender.character.level} {request.sender.character.name}
              </div>
              <div className="text-rpg-light-darker text-xs mt-1">
                Sent {new Date(request.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleRequest(request.id, true)}
                className="rpg-button-primary text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => handleRequest(request.id, false)}
                className="rpg-button-ghost text-sm"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
