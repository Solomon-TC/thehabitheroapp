import { useState } from 'react';
import { createClient } from '../lib/supabase';
import type { AppearanceInput, CharacterAppearance } from '../types/character';
import {
  SKIN_COLORS,
  HAIR_COLORS,
  EYE_COLORS,
  OUTFIT_COLORS,
  DEFAULT_APPEARANCE
} from '../types/character';

interface CharacterCustomizationProps {
  characterId: string;
  initialAppearance?: CharacterAppearance;
}

export default function CharacterCustomization({ characterId, initialAppearance }: CharacterCustomizationProps) {
  const [appearance, setAppearance] = useState<AppearanceInput>(
    initialAppearance ? {
      skin_color: initialAppearance.skin_color,
      hair_color: initialAppearance.hair_color,
      eye_color: initialAppearance.eye_color,
      outfit_color: initialAppearance.outfit_color
    } : DEFAULT_APPEARANCE
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const { error: appearanceError } = await supabase
        .from('character_appearances')
        .upsert({
          character_id: characterId,
          ...appearance,
          updated_at: new Date().toISOString()
        });

      if (appearanceError) throw appearanceError;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save appearance');
    } finally {
      setLoading(false);
    }
  };

  const ColorOption = ({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-8 rounded-full transition-all duration-200 ${
        selected ? 'ring-2 ring-rpg-primary ring-offset-2' : ''
      }`}
      style={{
        backgroundColor: color,
        transform: selected ? 'scale(1.1)' : 'scale(1)',
        boxShadow: selected ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
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
            <ColorOption
              key={color}
              color={color}
              selected={appearance.skin_color === color}
              onClick={() => setAppearance(prev => ({ ...prev, skin_color: color }))}
            />
          ))}
        </div>
      </div>

      {/* Hair Color */}
      <div>
        <label className="block text-rpg-light mb-2">Hair Color</label>
        <div className="flex space-x-4">
          {HAIR_COLORS.map((color) => (
            <ColorOption
              key={color}
              color={color}
              selected={appearance.hair_color === color}
              onClick={() => setAppearance(prev => ({ ...prev, hair_color: color }))}
            />
          ))}
        </div>
      </div>

      {/* Eye Color */}
      <div>
        <label className="block text-rpg-light mb-2">Eye Color</label>
        <div className="flex space-x-4">
          {EYE_COLORS.map((color) => (
            <ColorOption
              key={color}
              color={color}
              selected={appearance.eye_color === color}
              onClick={() => setAppearance(prev => ({ ...prev, eye_color: color }))}
            />
          ))}
        </div>
      </div>

      {/* Outfit Color */}
      <div>
        <label className="block text-rpg-light mb-2">Outfit Color</label>
        <div className="flex space-x-4">
          {OUTFIT_COLORS.map((color) => (
            <ColorOption
              key={color}
              color={color}
              selected={appearance.outfit_color === color}
              onClick={() => setAppearance(prev => ({ ...prev, outfit_color: color }))}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-500 text-center">
          Appearance saved successfully!
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="rpg-button-primary w-full"
      >
        {loading ? 'Saving...' : 'Save Appearance'}
      </button>
    </div>
  );
}
