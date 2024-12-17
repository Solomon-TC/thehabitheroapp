import { useState } from 'react';
import { updateCharacterAppearance } from '../utils/character';
import type { AppearanceInput } from '../types/character';
import {
  SKIN_COLORS,
  HAIR_COLORS,
  EYE_COLORS,
  OUTFIT_COLORS
} from '../types/character';

interface CharacterCustomizationProps {
  characterId: string;
  initialAppearance: AppearanceInput;
  onUpdate?: (appearance: AppearanceInput) => void;
}

export default function CharacterCustomization({
  characterId,
  initialAppearance,
  onUpdate
}: CharacterCustomizationProps) {
  const [appearance, setAppearance] = useState<AppearanceInput>(initialAppearance);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await updateCharacterAppearance(characterId, appearance);
      if (onUpdate) {
        onUpdate(appearance);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appearance');
    } finally {
      setSaving(false);
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
    <div className="space-y-6">
      {/* Skin Color */}
      <div>
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
      <div>
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
      <div>
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
      <div>
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

      {error && (
        <div className="text-red-500 text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rpg-button-primary w-full"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
