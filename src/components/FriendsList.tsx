import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';
import { Friend } from '../types/database';
import CharacterAvatar from './CharacterAvatar';

interface FriendCharacter {
  id: string;
  name: string;
  level: number;
  character_appearance: {
    skin_color: string;
    hair_color: string;
    eye_color: string;
    outfit_color: string;
  };
}

interface FriendWithCharacter extends Omit<Friend, 'friend_id'> {
  friend_id: string;
  friend: {
    id: string;
    username: string;
    character: FriendCharacter;
  };
}

export function FriendsList() {
  const [friends, setFriends] = useState<FriendWithCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError('');

      // First get the user's friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('friend_id, friends_since');

      if (friendsError) throw friendsError;

      // Then get the details for each friend
      const friendPromises = friendsData.map(async (friend) => {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', friend.friend_id)
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
          .eq('user_id', friend.friend_id)
          .single();

        if (characterError) throw characterError;

        return {
          ...friend,
          friend: {
            id: userData.id,
            username: userData.username,
            character: characterData
          }
        };
      });

      const friendsWithDetails = await Promise.all(friendPromises);
      setFriends(friendsWithDetails as FriendWithCharacter[]);
    } catch (err) {
      setError('Failed to load friends');
      console.error('Error loading friends:', err);
    } finally {
      setLoading(false);
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

  if (friends.length === 0) {
    return (
      <div className="text-rpg-light text-center py-8">
        <p>No friends added yet.</p>
        <p className="text-rpg-light-darker mt-2">Search for players to add them as friends!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {friends.map((friend) => (
        <div key={friend.friend_id} className="rpg-panel">
          <div className="flex items-center space-x-4">
            <CharacterAvatar
              appearance={friend.friend.character.character_appearance}
              size="md"
            />
            <div>
              <h3 className="text-lg font-pixel text-rpg-light">
                {friend.friend.username}
              </h3>
              <div className="text-sm text-rpg-light-darker">
                Level {friend.friend.character.level} {friend.friend.character.name}
              </div>
              <div className="text-xs text-rpg-light-darker mt-1">
                Friends since {new Date(friend.friends_since).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="rpg-button-secondary text-sm"
              onClick={() => {/* TODO: Implement view profile */}}
            >
              View Profile
            </button>
            <button
              className="rpg-button-ghost text-sm text-red-500"
              onClick={() => {/* TODO: Implement remove friend */}}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
