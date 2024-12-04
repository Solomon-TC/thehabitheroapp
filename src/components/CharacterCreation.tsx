import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { supabase } from '../lib/supabase';
import Character from './Character';
import type { Character as CharacterType, CORE_ATTRIBUTES, CoreAttributeType } from '../types';
import { useNotification } from '../contexts/NotificationContext';

interface CharacterCreationProps {
  onComplete: () => void;
}

const CHARACTER_TYPES = [
  { 
    id: 'balanced',
    name: 'Balanced',
    description: 'Well-rounded development across all attributes',
    attributes: { physical: 2, financial: 2, mental: 2, spiritual: 2, social: 2 }
  },
  { 
    id: 'physical',
    name: 'Athlete',
    description: 'Focus on physical well-being and health',
    attributes: { physical: 4, financial: 1, mental: 2, spiritual: 1, social: 2 }
  },
  { 
    id: 'financial',
    name: 'Entrepreneur',
    description: 'Focus on financial growth and stability',
    attributes: { physical: 1, financial: 4, mental: 2, spiritual: 1, social: 2 }
  },
  { 
    id: 'mental',
    name: 'Scholar',
    description: 'Focus on mental growth and learning',
    attributes: { physical: 1, financial: 2, mental: 4, spiritual: 1, social: 2 }
  },
  { 
    id: 'spiritual',
    name: 'Sage',
    description: 'Focus on spiritual growth and inner peace',
    attributes: { physical: 1, financial: 1, mental: 2, spiritual: 4, social: 2 }
  },
  { 
    id: 'social',
    name: 'Socialite',
    description: 'Focus on relationships and communication',
    attributes: { physical: 1, financial: 1, mental: 2, spiritual: 2, social: 4 }
  }
];

const COLORS = [
  { value: '#4A90E2', name: 'Ocean Blue' },
  { value: '#50E3C2', name: 'Mystic Teal' },
  { value: '#F5A623', name: 'Solar Gold' },
  { value: '#D0021B', name: 'Phoenix Red' },
  { value: '#7ED321', name: 'Forest Green' },
  { value: '#9013FE', name: 'Arcane Purple' },
];

export default function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [step, setStep] = useState(1);
  const { showNotification } = useNotification();
  const [characterData, setCharacterData] = useState<Partial<CharacterType>>({
    name: '',
    character_type: '',
    appearance: {
      color: COLORS[0].value,
      accessories: [],
      achievements: [],
    },
    attributes: {
      physical: 1,
      financial: 1,
      mental: 1,
      spiritual: 1,
      social: 1,
    },
    custom_attributes: {},
    level: 1,
    experience: 0,
  });

  const handleCreateCharacter = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const selectedType = CHARACTER_TYPES.find(type => type.id === characterData.character_type);
      if (!selectedType) throw new Error('Invalid character type');

      const { error } = await supabase.from('characters').insert([
        {
          ...characterData,
          user_id: user.id,
          attributes: selectedType.attributes,
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
    <div className="min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="game-card overflow-hidden">
          {/* Progress Steps */}
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between mb-8">
              {[1, 2, 3].map((number) => (
                <div
                  key={number}
                  className={`flex items-center ${
                    step >= number ? 'text-primary-400' : 'text-white/40'
                  }`}
                >
                  <span
                    className={`level-badge ${
                      step >= number
                        ? 'bg-primary-500'
                        : 'bg-white/10'
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
                <h2 className="game-title text-2xl text-center mb-8">Choose Your Path</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {CHARACTER_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setCharacterData(prev => ({
                          ...prev,
                          character_type: type.id,
                          attributes: type.attributes,
                        }));
                        setStep(2);
                      }}
                      className={`game-card p-6 transition-all duration-300 ${
                        characterData.character_type === type.id
                          ? 'border-primary-500 shadow-game'
                          : 'border-white/20 hover:border-primary-400'
                      }`}
                    >
                      <h3 className="text-lg font-medium text-primary-400">{type.name}</h3>
                      <p className="mt-2 text-sm text-white/70">{type.description}</p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {Object.entries(type.attributes).map(([attr, value]) => (
                          <div key={attr} className="text-sm">
                            <span className="text-white/60 capitalize">{attr}:</span>
                            <span className="ml-1 text-primary-400">{value}</span>
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
                <h2 className="game-title text-2xl text-center mb-8">Customize Your Character</h2>
                
                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">Choose Your Colors</label>
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
                        className={`game-card p-4 text-center ${
                          characterData.appearance?.color === color.value
                            ? 'border-primary-500 shadow-game'
                            : 'border-white/20'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-sm text-white/80">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Character Preview */}
                <div className="h-64 game-card">
                  <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Character character={characterData as CharacterType} />
                    <OrbitControls />
                  </Canvas>
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="game-button w-full"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 3: Name Your Character */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="game-title text-2xl text-center mb-8">Name Your Legend</h2>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
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
                    className="game-input w-full"
                    placeholder="Enter a legendary name"
                  />
                </div>

                <button
                  onClick={handleCreateCharacter}
                  disabled={!characterData.name}
                  className="game-button w-full disabled:opacity-50"
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
