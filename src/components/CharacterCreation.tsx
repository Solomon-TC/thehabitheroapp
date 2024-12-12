import { useState } from 'react';
import { createCharacter } from '../utils/character';
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
          <div className="w-48 h-48 bg-white rounded-lg shadow-inner mb-4 flex items-center justify-center">
            <div className="relative">
              {/* Basic 2D character representation */}
              <div 
                className="w-32 h-32 rounded-full"
                style={{ backgroundColor: formData.skin_color }}
              >
                <div 
                  className="absolute w-24 h-24 top-[-12px] left-4 rounded-full"
                  style={{ backgroundColor: formData.hair_color }}
                />
                <div className="absolute w-4 h-4 top-12 left-8 rounded-full" style={{ backgroundColor: formData.eye_color }} />
                <div className="absolute w-4 h-4 top-12 left-20 rounded-full" style={{ backgroundColor: formData.eye_color }} />
              </div>
              <div 
                className="absolute bottom-0 left-0 right-0 h-16 rounded-lg"
                style={{ backgroundColor: formData.outfit === 'warrior' ? '#8B4513' : 
                                      formData.outfit === 'mage' ? '#4B0082' :
                                      formData.outfit === 'rogue' ? '#2F4F4F' :
                                      formData.outfit === 'noble' ? '#800020' :
                                      formData.outfit === 'explorer' ? '#556B2F' : '#696969' }}
              />
            </div>
          </div>
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
            <select
              id="hair_color"
              name="hair_color"
              value={formData.hair_color}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {HAIR_COLORS.map(color => (
                <option key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="skin_color" className="block text-sm font-medium text-gray-700">
              Skin Tone
            </label>
            <select
              id="skin_color"
              name="skin_color"
              value={formData.skin_color}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {SKIN_COLORS.map(color => (
                <option key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="eye_color" className="block text-sm font-medium text-gray-700">
              Eye Color
            </label>
            <select
              id="eye_color"
              name="eye_color"
              value={formData.eye_color}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {EYE_COLORS.map(color => (
                <option key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="outfit" className="block text-sm font-medium text-gray-700">
              Starting Outfit
            </label>
            <select
              id="outfit"
              name="outfit"
              value={formData.outfit}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {OUTFITS.map(outfit => (
                <option key={outfit} value={outfit}>
                  {outfit.charAt(0).toUpperCase() + outfit.slice(1)}
                </option>
              ))}
            </select>
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
