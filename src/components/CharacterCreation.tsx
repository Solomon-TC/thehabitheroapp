import { useState } from 'react';
import { createCharacter } from '../utils/character';
import CharacterAvatar from './CharacterAvatar';
import {
  HAIR_STYLES,
  HAIR_COLORS,
  SKIN_COLORS,
  EYE_COLORS,
  OUTFITS,
  type CharacterCreationFormData
} from '../types/character';

interface CharacterCreationProps {
  onCharacterCreated: () => void;
  onCancel: () => void;
}

export default function CharacterCreation({ onCharacterCreated, onCancel }: CharacterCreationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CharacterCreationFormData>({
    name: '',
    hair_style: HAIR_STYLES[0],
    hair_color: HAIR_COLORS[0],
    skin_color: SKIN_COLORS[0],
    eye_color: EYE_COLORS[0],
    outfit: OUTFITS[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createCharacter(formData);
      onCharacterCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Character</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Character Preview */}
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
          <CharacterAvatar
            hairStyle={formData.hair_style}
            hairColor={formData.hair_color}
            skinColor={formData.skin_color}
            eyeColor={formData.eye_color}
            outfit={formData.outfit}
            size="lg"
            className="mb-4"
          />
          <p className="text-lg font-medium text-gray-900">{formData.name || 'Your Character'}</p>
        </div>

        {/* Character Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Character Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label htmlFor="hair_style" className="block text-sm font-medium text-gray-700">
              Hair Style
            </label>
            <select
              id="hair_style"
              name="hair_style"
              value={formData.hair_style}
              onChange={handleChange}
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
                    formData.hair_color === color
                      ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, hair_color: color }))}
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
                    formData.skin_color === color
                      ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, skin_color: color }))}
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
                    formData.eye_color === color
                      ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, eye_color: color }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="outfit" className="block text-sm font-medium text-gray-700">
              Starting Class
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {OUTFITS.map(outfitOption => (
                <button
                  key={outfitOption}
                  type="button"
                  className={`p-3 rounded-lg border-2 ${
                    formData.outfit === outfitOption
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, outfit: outfitOption }))}
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
              {loading ? 'Creating...' : 'Create Character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
