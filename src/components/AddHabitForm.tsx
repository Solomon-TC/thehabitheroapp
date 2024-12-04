import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { HabitFormData, CORE_ATTRIBUTES, CoreAttributeType } from '../types';
import { useNotification } from '../contexts/NotificationContext';

interface AddHabitFormProps {
  onClose: () => void;
  onHabitAdded: () => void;
}

export default function AddHabitForm({ onClose, onHabitAdded }: AddHabitFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomAttribute, setIsCustomAttribute] = useState(false);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState<HabitFormData>({
    title: '',
    description: '',
    frequency: 'daily',
    target_count: 1,
    attribute_type: 'physical',
    is_custom_attribute: false,
    custom_attribute_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const attributeType = isCustomAttribute ? formData.custom_attribute_name! : formData.attribute_type;

      const { error } = await supabase.from('habits').insert([
        {
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          frequency: formData.frequency,
          target_count: formData.target_count,
          attribute_type: attributeType,
          is_custom_attribute: isCustomAttribute,
          current_streak: 0,
          longest_streak: 0,
          experience_reward: calculateExperienceReward(formData.frequency, formData.target_count),
          completed_dates: [],
        },
      ]);

      if (error) throw error;

      showNotification('Habit created successfully!', 'success');
      onHabitAdded();
      onClose();
    } catch (error) {
      console.error('Error creating habit:', error);
      showNotification('Failed to create habit', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateExperienceReward = (frequency: string, targetCount: number): number => {
    const baseXP = 10;
    const frequencyMultiplier = {
      daily: 1,
      weekly: 5,
      monthly: 20,
    }[frequency] || 1;

    return baseXP * frequencyMultiplier * targetCount;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="game-card max-w-md w-full p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">Add New Habit</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              required
              className="game-input w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter habit title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              className="game-input w-full h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your habit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Frequency</label>
            <select
              className="game-input w-full"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Count</label>
            <input
              type="number"
              min="1"
              required
              className="game-input w-full"
              value={formData.target_count}
              onChange={(e) => setFormData({ ...formData, target_count: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Attribute Type</label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={isCustomAttribute}
                onChange={(e) => setIsCustomAttribute(e.target.checked)}
                className="game-input"
              />
              <span className="text-sm">Create custom attribute</span>
            </div>

            {isCustomAttribute ? (
              <input
                type="text"
                required
                className="game-input w-full"
                value={formData.custom_attribute_name}
                onChange={(e) => setFormData({ ...formData, custom_attribute_name: e.target.value })}
                placeholder="Enter custom attribute name"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(CORE_ATTRIBUTES) as CoreAttributeType[]).map((attr) => (
                  <button
                    key={attr}
                    type="button"
                    onClick={() => setFormData({ ...formData, attribute_type: attr })}
                    className={`game-card p-2 flex items-center space-x-2 ${
                      formData.attribute_type === attr ? 'border-primary-500' : 'border-white/20'
                    }`}
                  >
                    <span>{CORE_ATTRIBUTES[attr].icon}</span>
                    <span>{CORE_ATTRIBUTES[attr].name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="game-button bg-gray-500 hover:bg-gray-600"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="game-button"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
