import { useState } from 'react';
import { createCharacter } from '../utils/character';
import type { AppearanceInput } from '../types/character';
import {
  SKIN_COLORS,
  HAIR_COLORS,
  EYE_COLORS,
  OUTFIT_COLORS,
  DEFAULT_APPEARANCE
} from '../types/character';

export default function CharacterCreation() {
  const [name, setName] = useState('');
  const [appearance, setAppearance] = useState<AppearanceInput>(DEFAULT_APPEARANCE);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a character name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createCharacter(name, appearance);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
      setLoading(false);
    }
  };

  const ColorOption = ({ color }: { color: string }) => (
    <div
      className="w-8 h-8 rounded-full cursor-pointer border-2 transition-all duration-200"
      style={{
        backgroundColor: color,
        borderColor: color,
        transform: 'scale(1)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    />
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-pixel text-rpg-primary mb-8">Create Your Character</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name Input */}
        <div className="rpg-panel">
          <label className="block text-rpg-light mb-2">Character Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rpg-input"
            placeholder="Enter character name"
          />
        </div>

        {/* Appearance Customization */}
        <div className="rpg-panel">
          <h2 className="text-xl font-pixel text-rpg-light mb-4">Appearance</h2>
          
          {/* Skin Color */}
          <div className="mb-6">
            <label className="block text-rpg-light mb-2">Skin Color</label>
            <div className="flex space-x-4">
              {SKIN_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAppearance(prev => ({ ...prev, skin_color: color }))}
                  className={`focus:outline-none ${appearance.skin_color === color ? 'ring-2 ring-rpg-primary ring-offset-2' : ''}`}
                >
                  <ColorOption color={color} />
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div className="mb-6">
            <label className="block text-rpg-light mb-2">Hair Color</label>
            <div className="flex space-x-4">
              {HAIR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAppearance(prev => ({ ...prev, hair_color: color }))}
                  className={`focus:outline-none ${appearance.hair_color === color ? 'ring-2 ring-rpg-primary ring-offset-2' : ''}`}
                >
                  <ColorOption color={color} />
                </button>
              ))}
            </div>
          </div>

          {/* Eye Color */}
          <div className="mb-6">
            <label className="block text-rpg-light mb-2">Eye Color</label>
            <div className="flex space-x-4">
              {EYE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAppearance(prev => ({ ...prev, eye_color: color }))}
                  className={`focus:outline-none ${appearance.eye_color === color ? 'ring-2 ring-rpg-primary ring-offset-2' : ''}`}
                >
                  <ColorOption color={color} />
                </button>
              ))}
            </div>
          </div>

          {/* Outfit Color */}
          <div className="mb-6">
            <label className="block text-rpg-light mb-2">Outfit Color</label>
            <div className="flex space-x-4">
              {OUTFIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAppearance(prev => ({ ...prev, outfit_color: color }))}
                  className={`focus:outline-none ${appearance.outfit_color === color ? 'ring-2 ring-rpg-primary ring-offset-2' : ''}`}
                >
                  <ColorOption color={color} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rpg-button-primary w-full"
        >
          {loading ? 'Creating...' : 'Create Character'}
        </button>
      </form>
    </div>
  );
}
