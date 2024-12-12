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

interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

const hairColors: ColorOption[] = [
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'blonde', label: 'Blonde', hex: '#FFD700' },
  { value: 'red', label: 'Red', hex: '#DC143C' },
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'blue', label: 'Blue', hex: '#4169E1' },
  { value: 'purple', label: 'Purple', hex: '#800080' },
  { value: 'green', label: 'Green', hex: '#228B22' }
];

const skinColors: ColorOption[] = [
  { value: 'fair', label: 'Fair', hex: '#FFE4C4' },
  { value: 'light', label: 'Light', hex: '#F5DEB3' },
  { value: 'medium', label: 'Medium', hex: '#DEB887' },
  { value: 'dark', label: 'Dark', hex: '#D2691E' },
  { value: 'deep', label: 'Deep', hex: '#8B4513' }
];

const eyeColors: ColorOption[] = [
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'blue', label: 'Blue', hex: '#4169E1' },
  { value: 'green', label: 'Green', hex: '#228B22' },
  { value: 'hazel', label: 'Hazel', hex: '#DAA520' },
  { value: 'gray', label: 'Gray', hex: '#808080' },
  { value: 'amber', label: 'Amber', hex: '#FFA500' },
  { value: 'violet', label: 'Violet', hex: '#800080' }
];

const outfitInfo = [
  { value: 'warrior', label: 'Warrior', icon: '⚔️', description: 'Strong and resilient' },
  { value: 'mage', label: 'Mage', icon: '🔮', description: 'Wise and powerful' },
  { value: 'rogue', label: 'Rogue', icon: '🗡️', description: 'Quick and agile' },
  { value: 'noble', label: 'Noble', icon: '👑', description: 'Charismatic leader' },
  { value: 'explorer', label: 'Explorer', icon: '🗺️', description: 'Adventurous spirit' }
];

const ColorPicker = ({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: ColorOption[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="grid grid-cols-4 gap-2">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          className={`w-full aspect-square rounded-full border-2 transition-all ${
            value === option.value
              ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 scale-110'
              : 'border-gray-300 hover:border-gray-400 hover:scale-105'
          }`}
          style={{ backgroundColor: option.hex }}
          onClick={() => onChange(option.value)}
          title={option.label}
        />
      ))}
    </div>
  </div>
);

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
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Character</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Character Preview */}
        <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
          <CharacterAvatar
            hairStyle={appearance.hair_style}
            hairColor={appearance.hair_color}
            skinColor={appearance.skin_color}
            eyeColor={appearance.eye_color}
            outfit={appearance.outfit}
            size="lg"
            className="mb-4"
          />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">Preview</p>
            <p className="text-sm text-gray-500">Changes will be saved when you click "Save Changes"</p>
          </div>
        </div>

        {/* Customization Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hair Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hair Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HAIR_STYLES.map(style => (
                <button
                  key={style}
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-all ${
                    appearance.hair_style === style
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setAppearance(prev => ({ ...prev, hair_style: style }))}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <ColorPicker
            label="Hair Color"
            options={hairColors}
            value={appearance.hair_color}
            onChange={value => setAppearance(prev => ({ ...prev, hair_color: value }))}
          />

          <ColorPicker
            label="Skin Tone"
            options={skinColors}
            value={appearance.skin_color}
            onChange={value => setAppearance(prev => ({ ...prev, skin_color: value }))}
          />

          <ColorPicker
            label="Eye Color"
            options={eyeColors}
            value={appearance.eye_color}
            onChange={value => setAppearance(prev => ({ ...prev, eye_color: value }))}
          />

          {/* Class/Outfit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {outfitInfo.map(({ value, label, icon, description }) => (
                <button
                  key={value}
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    appearance.outfit === value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setAppearance(prev => ({ ...prev, outfit: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-gray-500">{description}</div>
                    </div>
                  </div>
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
