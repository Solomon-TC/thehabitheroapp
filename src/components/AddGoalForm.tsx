import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GoalFormData, CORE_ATTRIBUTES, CoreAttributeType } from '../types';
import { useNotification } from '../contexts/NotificationContext';

interface AddGoalFormProps {
  onClose: () => void;
  onGoalAdded: () => void;
}

export default function AddGoalForm({ onClose, onGoalAdded }: AddGoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomAttribute, setIsCustomAttribute] = useState(false);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 week
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

      const { error } = await supabase.from('goals').insert([
        {
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          target_date: formData.target_date,
          attribute_type: attributeType,
          is_custom_attribute: isCustomAttribute,
          progress: 0,
          status: 'not_started',
          experience_reward: calculateExperienceReward(new Date(formData.target_date)),
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      showNotification('Goal created successfully!', 'success');
      onGoalAdded();
      onClose();
    } catch (error) {
      console.error('Error creating goal:', error);
      showNotification('Failed to create goal', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateExperienceReward = (targetDate: Date): number => {
    const daysUntilTarget = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const baseXP = 50; // Base XP for completing a goal
    const timeMultiplier = Math.max(1, Math.min(4, daysUntilTarget / 7)); // 1-4x multiplier based on duration
    return Math.round(baseXP * timeMultiplier);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="game-card max-w-md w-full p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">Add New Goal</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              required
              className="game-input w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter goal title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              className="game-input w-full h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Date</label>
            <input
              type="date"
              required
              className="game-input w-full"
              value={formData.target_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
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
              {isLoading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
