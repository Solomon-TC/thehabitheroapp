import { useEffect, useState } from 'react';
import AuthWrapper from '../components/AuthWrapper';
import { getCharacter } from '../utils/character';
import CharacterCustomization from '../components/CharacterCustomization';
import type { Character } from '../types/character';

function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    loadCharacter();
  }, []);

  const loadCharacter = async () => {
    try {
      setLoading(true);
      setError('');
      const characterData = await getCharacter();
      setCharacter(characterData);
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

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-pixel text-rpg-primary mb-8">Account Settings</h1>

      {character && (
        <div className="rpg-panel">
          <h2 className="text-xl font-pixel text-rpg-light mb-4">Character Customization</h2>
          <CharacterCustomization
            characterId={character.id}
            initialAppearance={character.character_appearance}
          />
        </div>
      )}
    </div>
  );
}

export default function Account() {
  return (
    <AuthWrapper>
      <AccountPage />
    </AuthWrapper>
  );
}
