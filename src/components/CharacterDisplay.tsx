import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';
import type { Character } from '../types/character';
import CharacterAvatar from './CharacterAvatar';

interface CharacterDisplayProps {
  characterId?: string;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function CharacterDisplay({ characterId, showStats = true, size = 'lg' }: CharacterDisplayProps) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadCharacter();
  }, [characterId]);

  const loadCharacter = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: character, error: characterError } = await supabase
        .from('characters')
        .select(`
          *,
          character_appearance:character_appearances(*)
        `)
        .eq('id', characterId || user.id)
        .single();

      if (characterError) throw characterError;
      if (!character) throw new Error('Character not found');

      setCharacter(character as Character);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
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

  if (error || !character) {
    return (
      <div className="text-red-500 text-center py-4">
        {error || 'Failed to load character'}
      </div>
    );
  }

  return (
    <div className="rpg-panel">
      <div className="flex items-center space-x-6">
        <CharacterAvatar
          appearance={character.character_appearance}
          size={size}
        />
        <div>
          <h2 className="text-2xl font-pixel text-rpg-light">{character.name}</h2>
          <div className="text-rpg-light-darker">Level {character.level}</div>
        </div>
      </div>

      {showStats && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {/* Experience Bar */}
          <div className="col-span-2">
            <div className="flex justify-between text-sm text-rpg-light-darker mb-1">
              <span>Experience</span>
              <span>{character.experience} XP</span>
            </div>
            <div className="h-2 bg-rpg-dark-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-rpg-primary"
                style={{ width: `${(character.experience / (character.level * 1000)) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="text-sm text-rpg-light-darker mb-1">Strength</div>
            <div className="h-2 bg-rpg-dark-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-rarity-rare"
                style={{ width: `${(character.strength / 20) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-sm text-rpg-light-darker mb-1">Agility</div>
            <div className="h-2 bg-rpg-dark-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-rarity-epic"
                style={{ width: `${(character.agility / 20) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-sm text-rpg-light-darker mb-1">Intelligence</div>
            <div className="h-2 bg-rpg-dark-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-rarity-legendary"
                style={{ width: `${(character.intelligence / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
