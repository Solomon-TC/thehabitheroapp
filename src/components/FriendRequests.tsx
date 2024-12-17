import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase';
import CharacterAvatar from './CharacterAvatar';
import type { AppearanceInput } from '../types/character';

interface FriendRequest {
  id: string;
  created_at: string;
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
}

interface SupabaseFriendRequest {
  id: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    character: {
      id: string;
      name: string;
      level: number;
      character_appearance: {
        skin_color: string;
        hair_color: string;
        eye_color: string;
        outfit_color: string;
      }[];
    }[];
  };
}

export default function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get pending friend requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('friend_requests')
        .select(`
          id,
          created_at,
          sender:sender_id (
            id,
            username,
            character:characters (
              id,
              name,
              level,
              character_appearance:character_appearances (
                skin_color,
                hair_color,
                eye_color,
                outfit_color
              )
            )
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;
      if (!requestsData) return;

      // Transform the data to match our FriendRequest type
      const fullRequests = (requestsData as unknown as SupabaseFriendRequest[]).map((request) => {
        const character = request.sender.character[0];
        const appearance = character.character_appearance[0];
        
        return {
          id: request.id,
          created_at: request.created_at,
          sender: {
            id: request.sender.id,
            username: request.sender.username,
            character: {
              id: character.id,
              name: character.name,
              level: character.level,
              character_appearance: {
                skin_color: appearance.skin_color,
                hair_color: appearance.hair_color,
                eye_color: appearance.eye_color,
                outfit_color: appearance.outfit_color
              }
            }
          }
        };
      });

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
      <div className="text-rpg-light-darker text-center py-4">
        No pending friend requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="rpg-panel-secondary p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CharacterAvatar appearance={request.sender.character.character_appearance} />
              <div>
                <div className="text-rpg-light font-semibold">{request.sender.username}</div>
                <div className="text-rpg-light-darker text-sm">
                  Level {request.sender.character.level} {request.sender.character.name}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleRequest(request.id, true)}
                className="rpg-button-primary"
              >
                Accept
              </button>
              <button
                onClick={() => handleRequest(request.id, false)}
                className="rpg-button-secondary"
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
