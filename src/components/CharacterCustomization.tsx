import { useState } from 'react';
import { updateCharacterAppearance } from '../utils/character';
import CharacterAvatar from './CharacterAvatar';
import {
  HAIR_STYLES,
  SHIRT_STYLES,
  PANTS_STYLES,
  SHOES_STYLES,
  COLOR_PALETTE,
  type AppearanceState,
  type HairStyle,
  type ShirtStyle,
  type PantsStyle,
  type ShoesStyle,
  type ClothingColor,
  type CharacterAppearance,
  type HairColor,
  type SkinColor,
  type EyeColor
} from '../types/character';

interface CharacterCustomizationProps {
  characterId: string;
  currentAppearance: CharacterAppearance;
  onCustomized: () => void;
  onCancel: () => void;
}

export default function CharacterCustomization({
  characterId,
  currentAppearance,
  onCustomized,
  onCancel
}: CharacterCustomizationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appearance, setAppearance] = useState<AppearanceState>({
    hair_style: currentAppearance.hair_style as HairStyle,
    hair_color: currentAppearance.hair_color as HairColor,
    skin_color: currentAppearance.skin_color as SkinColor,
    eye_color: currentAppearance.eye_color as EyeColor,
    shirt_style: currentAppearance.shirt_style as ShirtStyle,
    shirt_color: currentAppearance.shirt_color as ClothingColor,
    pants_style: currentAppearance.pants_style as PantsStyle,
    pants_color: currentAppearance.pants_color as ClothingColor,
    shoes_style: currentAppearance.shoes_style as ShoesStyle,
    shoes_color: currentAppearance.shoes_color as ClothingColor,
    created_at: currentAppearance.created_at,
    updated_at: new Date().toISOString()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateCharacterAppearance(characterId, appearance);
      onCustomized();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appearance');
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
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
        Customize Your Character
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
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

        <div className="space-y-6">
          {/* Hair */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Hair Style</label>
            <select
              value={appearance.hair_style}
              onChange={(e) => updateAppearance('hair_style', e.target.value as HairStyle)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {HAIR_STYLES.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hair Color</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Skin Color</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
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
          </div>

          {/* Outfit */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Outfit Style</label>
            <div className="mt-4 space-y-4">
              <select
                value={appearance.shirt_style}
                onChange={(e) => updateAppearance('shirt_style', e.target.value as ShirtStyle)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {SHIRT_STYLES.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>

              <div className="grid grid-cols-5 gap-2">
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
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
