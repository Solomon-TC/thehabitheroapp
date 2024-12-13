import { useState } from 'react';
import { createCharacter } from '../utils/character';
import CharacterAvatar from './CharacterAvatar';
import {
  HAIR_STYLES,
  HAIR_COLORS,
  SKIN_COLORS,
  EYE_COLORS,
  SHIRT_STYLES,
  PANTS_STYLES,
  SHOES_STYLES,
  CLOTHING_COLORS,
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
    shirt_style: SHIRT_STYLES[0],
    shirt_color: CLOTHING_COLORS[0],
    pants_style: PANTS_STYLES[0],
    pants_color: CLOTHING_COLORS[0],
    shoes_style: SHOES_STYLES[0],
    shoes_color: CLOTHING_COLORS[0]
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

  const ColorPicker = ({
    label,
    colors,
    value,
    onChange
  }: {
    label: string;
    colors: readonly string[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="grid grid-cols-4 gap-2">
        {colors.map(color => (
          <button
            key={color}
            type="button"
            className={`w-full aspect-square rounded-full border-2 ${
              value === color
                ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  );

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
            shirtStyle={formData.shirt_style}
            shirtColor={formData.shirt_color}
            pantsStyle={formData.pants_style}
            pantsColor={formData.pants_color}
            shoesStyle={formData.shoes_style}
            shoesColor={formData.shoes_color}
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

          <ColorPicker
            label="Hair Color"
            colors={HAIR_COLORS}
            value={formData.hair_color}
            onChange={value => setFormData(prev => ({ ...prev, hair_color: value }))}
          />

          <ColorPicker
            label="Skin Tone"
            colors={SKIN_COLORS}
            value={formData.skin_color}
            onChange={value => setFormData(prev => ({ ...prev, skin_color: value }))}
          />

          <ColorPicker
            label="Eye Color"
            colors={EYE_COLORS}
            value={formData.eye_color}
            onChange={value => setFormData(prev => ({ ...prev, eye_color: value }))}
          />

          <div>
            <label htmlFor="shirt_style" className="block text-sm font-medium text-gray-700">
              Shirt Style
            </label>
            <select
              id="shirt_style"
              name="shirt_style"
              value={formData.shirt_style}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {SHIRT_STYLES.map(style => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <ColorPicker
            label="Shirt Color"
            colors={CLOTHING_COLORS}
            value={formData.shirt_color}
            onChange={value => setFormData(prev => ({ ...prev, shirt_color: value }))}
          />

          <div>
            <label htmlFor="pants_style" className="block text-sm font-medium text-gray-700">
              Pants Style
            </label>
            <select
              id="pants_style"
              name="pants_style"
              value={formData.pants_style}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {PANTS_STYLES.map(style => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <ColorPicker
            label="Pants Color"
            colors={CLOTHING_COLORS}
            value={formData.pants_color}
            onChange={value => setFormData(prev => ({ ...prev, pants_color: value }))}
          />

          <div>
            <label htmlFor="shoes_style" className="block text-sm font-medium text-gray-700">
              Shoes Style
            </label>
            <select
              id="shoes_style"
              name="shoes_style"
              value={formData.shoes_style}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {SHOES_STYLES.map(style => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <ColorPicker
            label="Shoes Color"
            colors={CLOTHING_COLORS}
            value={formData.shoes_color}
            onChange={value => setFormData(prev => ({ ...prev, shoes_color: value }))}
          />

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
