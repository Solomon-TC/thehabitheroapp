import { FriendSuggestion } from '../types';
import CharacterDisplay from './CharacterDisplay';

interface FriendSuggestionsProps {
  suggestions: FriendSuggestion[];
  onSendRequest: (friendId: string) => void;
}

export default function FriendSuggestions({ suggestions, onSendRequest }: FriendSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <div className="game-card p-6">
        <h2 className="text-xl font-bold mb-4">Suggested Friends</h2>
        <p className="text-white/60 text-center">No suggestions available</p>
      </div>
    );
  }

  return (
    <div className="game-card p-6">
      <h2 className="text-xl font-bold mb-4">Suggested Friends</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion) => (
          <div key={suggestion.user_id} className="game-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">{suggestion.email}</h3>
                {suggestion.common_friends > 0 && (
                  <p className="text-sm text-white/60">
                    {suggestion.common_friends} mutual friend{suggestion.common_friends > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            {suggestion.character && (
              <div className="h-48">
                <CharacterDisplay character={suggestion.character} isPreview />
              </div>
            )}
            <div className="mt-4">
              <button
                onClick={() => onSendRequest(suggestion.user_id)}
                className="game-button w-full"
              >
                Send Friend Request
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
