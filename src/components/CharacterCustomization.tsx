import { useState } from 'react';
import { updateCharacterAppearance } from '../utils/character';
import CharacterAvatar from './CharacterAvatar';
import {
  HAIR_STYLES,
  HAIR_COLORS,
  SKIN_COLORS,
  EYE_COLORS,
  SHIRT_STYLES,
  PANTS_STYLES,
  SHOES_STYLES,
  ARMOR_HEAD,
  ARMOR_BODY,
  ARMOR_LEGS,
  ACCESSORIES,
  CLOTHING_COLORS,
  getColorHex,
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

const StylePicker = ({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="grid grid-cols-3 gap-2">
      {options.map(style => (
        <button
          key={style}
          type="button"
          className={`p-3 rounded-lg border-2 transition-all ${
            value === style
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => onChange(style)}
        >
          {style.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </button>
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
  const [appearance, setAppearance] = useState(currentAppearance);

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
            shirtStyle={appearance.shirt_style}
            shirtColor={appearance.shirt_color}
            pantsStyle={appearance.pants_style}
            pantsColor={appearance.pants_color}
            shoesStyle={appearance.shoes_style}
            shoesColor={appearance.shoes_color}
            armorHead={appearance.armor_head}
            armorBody={appearance.armor_body}
            armorLegs={appearance.armor_legs}
            accessory1={appearance.accessory_1}
            accessory2={appearance.accessory_2}
            size="lg"
            className="mb-4"
          />
          <div className="text-center">
            <p className="text-sm text-gray-500">Changes will be saved when you click "Save Changes"</p>
          </div>
        </div>

        {/* Customization Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
          <div className="space-y-6">
            {/* Basic Appearance */}
            <StylePicker
              label="Hair Style"
              options={HAIR_STYLES}
              value={appearance.hair_style}
              onChange={value => setAppearance(prev => ({ ...prev, hair_style: value }))}
            />

            <ColorPicker
              label="Hair Color"
              options={HAIR_COLORS.map(color => ({
                value: color,
                label: color.charAt(0).toUpperCase() + color.slice(1),
                hex: getColorHex(color)
              }))}
              value={appearance.hair_color}
              onChange={value => setAppearance(prev => ({ ...prev, hair_color: value }))}
            />

            <ColorPicker
              label="Skin Tone"
              options={SKIN_COLORS.map(color => ({
                value: color,
                label: color.charAt(0).toUpperCase() + color.slice(1),
                hex: getColorHex(color)
              }))}
              value={appearance.skin_color}
              onChange={value => setAppearance(prev => ({ ...prev, skin_color: value }))}
            />

            <ColorPicker
              label="Eye Color"
              options={EYE_COLORS.map(color => ({
                value: color,
                label: color.charAt(0).toUpperCase() + color.slice(1),
                hex: getColorHex(color)
              }))}
              value={appearance.eye_color}
              onChange={value => setAppearance(prev => ({ ...prev, eye_color: value }))}
            />

            {/* Clothing */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Clothing</h3>
              
              <StylePicker
                label="Shirt Style"
                options={SHIRT_STYLES}
                value={appearance.shirt_style}
                onChange={value => setAppearance(prev => ({ ...prev, shirt_style: value }))}
              />

              <ColorPicker
                label="Shirt Color"
                options={CLOTHING_COLORS.map(color => ({
                  value: color,
                  label: color.charAt(0).toUpperCase() + color.slice(1),
                  hex: getColorHex(color)
                }))}
                value={appearance.shirt_color}
                onChange={value => setAppearance(prev => ({ ...prev, shirt_color: value }))}
              />

              <StylePicker
                label="Pants Style"
                options={PANTS_STYLES}
                value={appearance.pants_style}
                onChange={value => setAppearance(prev => ({ ...prev, pants_style: value }))}
              />

              <ColorPicker
                label="Pants Color"
                options={CLOTHING_COLORS.map(color => ({
                  value: color,
                  label: color.charAt(0).toUpperCase() + color.slice(1),
                  hex: getColorHex(color)
                }))}
                value={appearance.pants_color}
                onChange={value => setAppearance(prev => ({ ...prev, pants_color: value }))}
              />

              <StylePicker
                label="Shoes Style"
                options={SHOES_STYLES}
                value={appearance.shoes_style}
                onChange={value => setAppearance(prev => ({ ...prev, shoes_style: value }))}
              />

              <ColorPicker
                label="Shoes Color"
                options={CLOTHING_COLORS.map(color => ({
                  value: color,
                  label: color.charAt(0).toUpperCase() + color.slice(1),
                  hex: getColorHex(color)
                }))}
                value={appearance.shoes_color}
                onChange={value => setAppearance(prev => ({ ...prev, shoes_color: value }))}
              />
            </div>

            {/* Armor */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Armor</h3>
              
              <StylePicker
                label="Head Armor"
                options={['none', ...ARMOR_HEAD]}
                value={appearance.armor_head || 'none'}
                onChange={value => setAppearance(prev => ({ ...prev, armor_head: value === 'none' ? undefined : value }))}
              />

              <StylePicker
                label="Body Armor"
                options={['none', ...ARMOR_BODY]}
                value={appearance.armor_body || 'none'}
                onChange={value => setAppearance(prev => ({ ...prev, armor_body: value === 'none' ? undefined : value }))}
              />

              <StylePicker
                label="Leg Armor"
                options={['none', ...ARMOR_LEGS]}
                value={appearance.armor_legs || 'none'}
                onChange={value => setAppearance(prev => ({ ...prev, armor_legs: value === 'none' ? undefined : value }))}
              />
            </div>

            {/* Accessories */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Accessories</h3>
              
              <StylePicker
                label="Accessory 1"
                options={['none', ...ACCESSORIES]}
                value={appearance.accessory_1 || 'none'}
                onChange={value => setAppearance(prev => ({ ...prev, accessory_1: value === 'none' ? undefined : value }))}
              />

              <StylePicker
                label="Accessory 2"
                options={['none', ...ACCESSORIES]}
                value={appearance.accessory_2 || 'none'}
                onChange={value => setAppearance(prev => ({ ...prev, accessory_2: value === 'none' ? undefined : value }))}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
