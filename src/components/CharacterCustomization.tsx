import { useState } from 'react';
import { updateCharacterAppearance } from '../utils/character';
import CharacterAvatar from './CharacterAvatar';
import {
  HAIR_STYLES,
  HAIR_COLORS,
  SKIN_COLORS,
  EYE_COLORS,
  OUTFITS,
  type CharacterAppearance
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
  const [appearance, setAppearance] = useState({
    hair_style: currentAppearance.hair_style,
    hair_color: currentAppearance.hair_color,
    skin_color: currentAppearance.skin_color,
    eye_color: currentAppearance.eye_color,
    outfit: currentAppearance.outfit
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Character</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Character Preview */}
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
          <CharacterAvatar
            hairStyle={appearance.hair_style}
            hairColor={appearance.hair_color}
            skinColor={appearance.skin_color}
            eyeColor={appearance.eye_color}
            outfit={appearance.outfit}
            size="lg"
            className="mb-4"
          />
          <p className="text-lg font-medium text-gray-900">Preview</p>
        </div>

        {/* Customization Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="hair_style" className="block text-sm font-medium text-gray-700">
              Hair Style
            </label>
            <select
              id="hair_style"
              name="hair_style"
              value={appearance.hair_style}
              onChange={(e) => setAppearance(prev => ({ ...prev, hair_style: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {HAIR_STYLES.map(style => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="hair_color" className="block text-sm font-medium text-gray-700">
              Hair Color
            </label>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {HAIR_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-full aspect-square rounded-full border-2 ${
                    appearance.hair_color === color
                      ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAppearance(prev => ({ ...prev, hair_color: color }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="skin_color" className="block text-sm font-medium text-gray-700">
              Skin Tone
            </label>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {SKIN_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-full aspect-square rounded-full border-2 ${
                    appearance.skin_color === color
                      ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAppearance(prev => ({ ...prev, skin_color: color }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="eye_color" className="block text-sm font-medium text-gray-700">
              Eye Color
            </label>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {EYE_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-full aspect-square rounded-full border-2 ${
                    appearance.eye_color === color
                      ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAppearance(prev => ({ ...prev, eye_color: color }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="outfit" className="block text-sm font-medium text-gray-700">
              Class Outfit
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {OUTFITS.map(outfitOption => (
                <button
                  key={outfitOption}
                  type="button"
                  className={`p-3 rounded-lg border-2 ${
                    appearance.outfit === outfitOption
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setAppearance(prev => ({ ...prev, outfit: outfitOption }))}
                >
                  {outfitOption.charAt(0).toUpperCase() + outfitOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
