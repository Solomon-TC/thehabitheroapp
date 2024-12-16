import { useState } from 'react';
import { createCharacter } from '../utils/character';
import type { AppearanceState, AppearanceInput, ClothingColor } from '../types/character';
import {
  HAIR_STYLES,
  SHIRT_STYLES,
  PANTS_STYLES,
  SHOES_STYLES,
  COLOR_PALETTE,
  createDefaultAppearance
} from '../types/character';

interface CharacterCreationProps {
  onCharacterCreated: () => void;
}

export default function CharacterCreation({ onCharacterCreated }: CharacterCreationProps) {
  const [name, setName] = useState('');
  const [appearance, setAppearance] = useState<AppearanceState>(createDefaultAppearance());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a character name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const appearanceInput: AppearanceInput = {
        hair_style: appearance.hair_style,
        hair_color: appearance.hair_color,
        skin_color: appearance.skin_color,
        eye_color: appearance.eye_color,
        shirt_style: appearance.shirt_style,
        shirt_color: appearance.shirt_color,
        pants_style: appearance.pants_style,
        pants_color: appearance.pants_color,
        shoes_style: appearance.shoes_style,
        shoes_color: appearance.shoes_color
      };

      await createCharacter(name, appearanceInput);
      onCharacterCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  const updateAppearance = (updates: Partial<AppearanceState>) => {
    setAppearance(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rpg-panel">
      <h1 className="text-2xl font-pixel text-rpg-primary mb-6">Create Your Character</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-rpg-light mb-2">
            Character Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rpg-border w-full p-2 bg-transparent text-rpg-light"
            placeholder="Enter character name"
          />
        </div>

        {/* Appearance Customization */}
        <div className="space-y-4">
          {/* Hair Style */}
          <div>
            <label className="block text-sm font-medium text-rpg-light mb-2">
              Hair Style
            </label>
            <div className="grid grid-cols-5 gap-2">
              {HAIR_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateAppearance({ hair_style: style })}
                  className={`rpg-button ${
                    appearance.hair_style === style ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <label className="block text-sm font-medium text-rpg-light mb-2">
              Hair Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.hair.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateAppearance({ hair_color: color.value })}
                  className={`w-8 h-8 rounded-full ${
                    appearance.hair_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Skin Color */}
          <div>
            <label className="block text-sm font-medium text-rpg-light mb-2">
              Skin Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PALETTE.skin.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateAppearance({ skin_color: color.value })}
                  className={`w-8 h-8 rounded-full ${
                    appearance.skin_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Eye Color */}
          <div>
            <label className="block text-sm font-medium text-rpg-light mb-2">
              Eye Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.eyes.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateAppearance({ eye_color: color.value })}
                  className={`w-8 h-8 rounded-full ${
                    appearance.eye_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Shirt Style */}
          <div>
            <label className="block text-sm font-medium text-rpg-light mb-2">
              Shirt Style
            </label>
            <div className="grid grid-cols-5 gap-2">
              {SHIRT_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateAppearance({ shirt_style: style })}
                  className={`rpg-button ${
                    appearance.shirt_style === style ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Shirt Color */}
          <div>
            <label className="block text-sm font-medium text-rpg-light mb-2">
              Shirt Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_PALETTE.clothing.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateAppearance({ shirt_color: color.value })}
                  className={`w-8 h-8 rounded-full ${
                    appearance.shirt_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Pants Style */}
          <div>
            <label className="block text-sm font-medium text-rpg-light mb-2">
              Pants Style
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PANTS_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateAppearance({ pants_style: style })}
                  className={`rpg-button ${
                    appearance.pants_style === style ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Pants Color */}
          <div>
            <label className="block text-sm font-medium text-rpg-light mb-2">
              Pants Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_PALETTE.clothing.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateAppearance({ pants_color: color.value })}
                  className={`w-8 h-8 rounded-full ${
                    appearance.pants_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Shoes Style */}
          <div>
            <label className="block text-sm font-medium text-rpg-light mb-2">
              Shoes Style
            </label>
            <div className="grid grid-cols-5 gap-2">
              {SHOES_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateAppearance({ shoes_style: style })}
                  className={`rpg-button ${
                    appearance.shoes_style === style ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Shoes Color */}
          <div>
            <label className="block text-sm font-medium text-rpg-light mb-2">
              Shoes Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_PALETTE.clothing.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateAppearance({ shoes_color: color.value })}
                  className={`w-8 h-8 rounded-full ${
                    appearance.shoes_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rpg-button w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
            </div>
          ) : (
            'Create Character'
          )}
        </button>
      </form>
    </div>
  );
}
