import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Character from './Character';
import type { Character as CharacterType } from '../types';
import { useNotification } from '../contexts/NotificationContext';

interface CharacterCreationProps {
  onComplete: () => void;
}

const CHARACTER_TYPES = [
  { 
    id: 'balanced',
    name: 'Balanced',
    description: 'Well-rounded development across all attributes',
    attributes: { strength: 10, agility: 10, wisdom: 10, charisma: 10 }
  },
  { 
    id: 'warrior',
    name: 'Warrior',
    description: 'Focus on physical strength and endurance',
    attributes: { strength: 15, agility: 12, wisdom: 7, charisma: 6 }
  },
  { 
    id: 'scholar',
    name: 'Scholar',
    description: 'Focus on mental growth and learning',
    attributes: { strength: 6, agility: 8, wisdom: 15, charisma: 11 }
  },
  { 
    id: 'diplomat',
    name: 'Diplomat',
    description: 'Focus on social skills and leadership',
    attributes: { strength: 7, agility: 9, wisdom: 12, charisma: 15 }
  }
];

const COLORS = [
  { value: '#4F46E5', name: 'Royal Purple' },
  { value: '#10B981', name: 'Emerald' },
  { value: '#EF4444', name: 'Ruby' },
  { value: '#F59E0B', name: 'Amber' },
  { value: '#3B82F6', name: 'Sapphire' },
  { value: '#8B5CF6', name: 'Amethyst' },
];

export default function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [step, setStep] = useState(1);
  const { showNotification } = useNotification();
  const [characterData, setCharacterData] = useState<Partial<CharacterType>>({
    id: '',
    name: '',
    level: 1,
    experience: 0,
    appearance: {
      color: COLORS[0].value,
      accessories: []
    },
    stats: {
      strength: 10,
      agility: 10,
      wisdom: 10,
      charisma: 10
    },
    achievements: [],
    habits: [],
    goals: []
  });

  const handleCreateCharacter = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase.from('characters').insert([
        {
          ...characterData,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      showNotification('Character created successfully!', 'success');
      onComplete();
    } catch (error) {
      console.error('Error creating character:', error);
      showNotification('Failed to create character', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Progress Steps */}
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between mb-8">
              {[1, 2, 3].map((number) => (
                <div
                  key={number}
                  className={`flex items-center ${
                    step >= number ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                      step >= number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {number}
                  </span>
                  <span className="ml-2 text-sm font-medium">
                    {number === 1 ? 'Choose Path' : number === 2 ? 'Customize' : 'Name'}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 1: Character Type Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-8">Choose Your Path</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {CHARACTER_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setCharacterData(prev => ({
                          ...prev,
                          stats: type.attributes,
                        }));
                        setStep(2);
                      }}
                      className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                        characterData.stats === type.attributes
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <h3 className="text-lg font-medium text-blue-600">{type.name}</h3>
                      <p className="mt-2 text-sm text-gray-600">{type.description}</p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {Object.entries(type.attributes).map(([attr, value]) => (
                          <div key={attr} className="text-sm">
                            <span className="text-gray-500 capitalize">{attr}:</span>
                            <span className="ml-1 text-blue-600">{value}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Appearance Customization */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-8">Customize Your Character</h2>
                
                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Choose Your Colors</label>
                  <div className="grid grid-cols-3 gap-3">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() =>
                          setCharacterData(prev => ({
                            ...prev,
                            appearance: {
                              ...prev.appearance!,
                              color: color.value,
                            },
                          }))
                        }
                        className={`p-4 rounded-lg border-2 text-center ${
                          characterData.appearance?.color === color.value
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-sm text-gray-600">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Character Preview */}
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <Character character={characterData as CharacterType} />
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 3: Name Your Character */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-8">Name Your Legend</h2>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Character Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={characterData.name}
                    onChange={(e) =>
                      setCharacterData(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a legendary name"
                  />
                </div>

                <button
                  onClick={handleCreateCharacter}
                  disabled={!characterData.name}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Begin Your Quest
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
