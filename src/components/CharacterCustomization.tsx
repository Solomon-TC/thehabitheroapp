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
  type CharacterAppearance,
  type HairStyle,
  type ShirtStyle,
  type PantsStyle,
  type ShoesStyle,
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
  onCancel,
}: CharacterCustomizationProps) {
  const [appearance, setAppearance] = useState<AppearanceState>({
    hair_style: currentAppearance.hair_style,
    hair_color: currentAppearance.hair_color,
    skin_color: currentAppearance.skin_color,
    eye_color: currentAppearance.eye_color,
    shirt_style: currentAppearance.shirt_style,
    shirt_color: currentAppearance.shirt_color,
    pants_style: currentAppearance.pants_style,
    pants_color: currentAppearance.pants_color,
    shoes_style: currentAppearance.shoes_style,
    shoes_color: currentAppearance.shoes_color,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      await updateCharacterAppearance(characterId, appearance);
      onCustomized();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appearance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rpg-panel">
      <div className="flex items-start space-x-8">
        {/* Preview */}
        <div className="flex-shrink-0">
          <CharacterAvatar
            size="lg"
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

        {/* Customization Options */}
        <div className="flex-1 space-y-6">
          {/* Hair */}
          <div>
            <h3 className="text-lg font-medium text-rpg-light mb-2">Hair</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-rpg-light-darker mb-2">Style</label>
                <div className="grid grid-cols-5 gap-2">
                  {HAIR_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setAppearance({ ...appearance, hair_style: style })}
                      className={`rpg-button ${
                        appearance.hair_style === style ? 'ring-2 ring-rpg-primary' : ''
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-rpg-light-darker mb-2">Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.hair.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAppearance({ ...appearance, hair_color: color.value })}
                      className={`w-8 h-8 rounded-full ${
                        appearance.hair_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skin */}
          <div>
            <h3 className="text-lg font-medium text-rpg-light mb-2">Skin</h3>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.skin.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAppearance({ ...appearance, skin_color: color.value })}
                  className={`w-8 h-8 rounded-full ${
                    appearance.skin_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Eyes */}
          <div>
            <h3 className="text-lg font-medium text-rpg-light mb-2">Eyes</h3>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.eyes.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAppearance({ ...appearance, eye_color: color.value })}
                  className={`w-8 h-8 rounded-full ${
                    appearance.eye_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Shirt */}
          <div>
            <h3 className="text-lg font-medium text-rpg-light mb-2">Shirt</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-rpg-light-darker mb-2">Style</label>
                <div className="grid grid-cols-5 gap-2">
                  {SHIRT_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setAppearance({ ...appearance, shirt_style: style })}
                      className={`rpg-button ${
                        appearance.shirt_style === style ? 'ring-2 ring-rpg-primary' : ''
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-rpg-light-darker mb-2">Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {COLOR_PALETTE.clothing.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAppearance({ ...appearance, shirt_color: color.value })}
                      className={`w-8 h-8 rounded-full ${
                        appearance.shirt_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pants */}
          <div>
            <h3 className="text-lg font-medium text-rpg-light mb-2">Pants</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-rpg-light-darker mb-2">Style</label>
                <div className="grid grid-cols-5 gap-2">
                  {PANTS_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setAppearance({ ...appearance, pants_style: style })}
                      className={`rpg-button ${
                        appearance.pants_style === style ? 'ring-2 ring-rpg-primary' : ''
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-rpg-light-darker mb-2">Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {COLOR_PALETTE.clothing.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAppearance({ ...appearance, pants_color: color.value })}
                      className={`w-8 h-8 rounded-full ${
                        appearance.pants_color === color.value ? 'ring-2 ring-rpg-primary' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Shoes */}
          <div>
            <h3 className="text-lg font-medium text-rpg-light mb-2">Shoes</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-rpg-light-darker mb-2">Style</label>
                <div className="grid grid-cols-5 gap-2">
                  {SHOES_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setAppearance({ ...appearance, shoes_style: style })}
                      className={`rpg-button ${
                        appearance.shoes_style === style ? 'ring-2 ring-rpg-primary' : ''
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-rpg-light-darker mb-2">Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {COLOR_PALETTE.clothing.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAppearance({ ...appearance, shoes_color: color.value })}
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
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 text-red-500 text-sm">{error}</div>
      )}

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="rpg-button bg-rpg-dark-lighter"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="rpg-button"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
            </div>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
}
