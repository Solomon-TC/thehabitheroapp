import { FriendProfile } from '../types';
import CharacterDisplay from './CharacterDisplay';

interface FriendListProps {
  friends: FriendProfile[];
}

export default function FriendList({ friends }: FriendListProps) {
  if (friends.length === 0) {
    return (
      <div className="game-card p-6">
        <h2 className="text-xl font-bold mb-4">Friends</h2>
        <p className="text-white/60 text-center">No friends added yet. Start by sending some friend requests!</p>
      </div>
    );
  }

  return (
    <div className="game-card p-6">
      <h2 className="text-xl font-bold mb-4">Friends</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend) => (
          <div key={friend.id} className="game-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">{friend.email}</h3>
                <p className="text-sm text-white/60">Level {friend.character.level}</p>
              </div>
            </div>
            <div className="h-48">
              <CharacterDisplay character={friend.character} />
            </div>
            {friend.recent_activities.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {friend.recent_activities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="text-sm text-white/60">
                      {activity.activity_type}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
