import { useState } from 'react';
import { createCharacter } from '../utils/character';
import CharacterAvatar from './CharacterAvatar';
import {
  HAIR_STYLES,
  SHIRT_STYLES,
  PANTS_STYLES,
  SHOES_STYLES,
  COLOR_PALETTE,
  createDefaultAppearance,
  type AppearanceState,
  type HairStyle,
  type ShirtStyle,
  type PantsStyle,
  type ShoesStyle,
  type ClothingColor
} from '../types/character';

interface CharacterCreationProps {
  onCharacterCreated: () => void;
}

export default function CharacterCreation({ onCharacterCreated }: CharacterCreationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [appearance, setAppearance] = useState<AppearanceState>(createDefaultAppearance());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a character name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createCharacter(name, appearance);
      onCharacterCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
      setLoading(false);
    }
  };

  const updateAppearance = <K extends keyof AppearanceState>(
    key: K,
    value: AppearanceState[K]
  ) => {
    setAppearance(prev => ({
      ...prev,
      [key]: value,
      updated_at: new Date().toISOString()
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
        Create Your Character
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Character Preview */}
        <div className="flex justify-center">
          <CharacterAvatar
            size="lg"
            className="h-32 w-32"
            hairStyle={appearance.hair_style}
            hairColor={appearance.hair_color}
            skinColor={appearance.skin_color}
            eyeColor={appearance.eye_color}
            shirtStyle={appearance.shirt_style}
            shirtColor={appearance.shirt_color}
            pantsStyle={appearance.pants_style}
            pantsColor={appearance.pants_color}
            shoesStyle={appearance.shoes_style}
            shoesColor={appearance.shoes_color}
          />
        </div>

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Character Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        {/* Appearance Customization */}
        <div className="space-y-6">
          {/* Hair */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Hair Style</label>
            <select
              value={appearance.hair_style}
              onChange={(e) => updateAppearance('hair_style', e.target.value as HairStyle)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {HAIR_STYLES.map(style => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Hair Color</label>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {COLOR_PALETTE.HAIR.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full ${appearance.hair_color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateAppearance('hair_color', color)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Skin */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Skin Color</label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {COLOR_PALETTE.SKIN.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full ${appearance.skin_color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => updateAppearance('skin_color', color)}
                />
              ))}
            </div>
          </div>

          {/* Eyes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Eye Color</label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {COLOR_PALETTE.EYES.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full ${appearance.eye_color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => updateAppearance('eye_color', color)}
                />
              ))}
            </div>
          </div>

          {/* Outfit */}
          <div className="space-y-4">
            {/* Shirt */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Shirt Style</label>
              <select
                value={appearance.shirt_style}
                onChange={(e) => updateAppearance('shirt_style', e.target.value as ShirtStyle)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {SHIRT_STYLES.map(style => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </select>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Shirt Color</label>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.CLOTHING.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${appearance.shirt_color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateAppearance('shirt_color', color as ClothingColor)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Pants */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Pants Style</label>
              <select
                value={appearance.pants_style}
                onChange={(e) => updateAppearance('pants_style', e.target.value as PantsStyle)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {PANTS_STYLES.map(style => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </select>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Pants Color</label>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.CLOTHING.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${appearance.pants_color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateAppearance('pants_color', color as ClothingColor)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Shoes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Shoes Style</label>
              <select
                value={appearance.shoes_style}
                onChange={(e) => updateAppearance('shoes_style', e.target.value as ShoesStyle)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {SHOES_STYLES.map(style => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </select>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Shoes Color</label>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.CLOTHING.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${appearance.shoes_color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateAppearance('shoes_color', color as ClothingColor)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Character'}
          </button>
        </div>
      </form>
    </div>
  );
}
