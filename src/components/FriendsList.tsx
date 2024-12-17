import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';
import { Friend, Profile } from '../types/database';
import CharacterAvatar from './CharacterAvatar';

interface RawFriendData {
  friend_id: string;
  friends_since: string;
  profile: Profile;
  character: {
    characters: Array<{
      id: string;
      name: string;
      level: number;
      character_appearance: Array<{
        skin_color: string;
        hair_color: string;
        eye_color: string;
        outfit_color: string;
      }>;
    }>;
  };
}

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get friends list using the friends view
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select(`
          friend_id,
          friends_since,
          profile:profiles!friend_id(
            id,
            username,
            created_at,
            updated_at
          ),
          character:friend_id(
            characters(
              id,
              name,
              level,
              character_appearance:character_appearances(
                skin_color,
                hair_color,
                eye_color,
                outfit_color
              )
            )
          )
        `);

      if (friendsError) throw friendsError;
      if (!friendsData) return;

      // Transform the data to match our Friend type
      const transformedFriends: Friend[] = (friendsData as unknown as RawFriendData[]).map(friend => ({
        friend_id: friend.friend_id,
        friends_since: friend.friends_since,
        profile: friend.profile,
        character: {
          id: friend.character.characters[0].id,
          name: friend.character.characters[0].name,
          level: friend.character.characters[0].level,
          character_appearance: friend.character.characters[0].character_appearance[0]
        }
      }));

      setFriends(transformedFriends);
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
      <div className="text-rpg-light-darker text-center py-4">
        No friends yet. Try sending some friend requests!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <div key={friend.friend_id} className="rpg-panel-secondary p-4">
          <div className="flex items-center space-x-4">
            <CharacterAvatar appearance={friend.character.character_appearance} />
            <div>
              <div className="text-rpg-light font-semibold">{friend.profile.username}</div>
              <div className="text-rpg-light-darker text-sm">
                Level {friend.character.level} {friend.character.name}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
