import { useState } from 'react';
import { createClient } from '../lib/supabase';
import type { Goal } from '../types/database';

interface AddGoalFormProps {
  onGoalAdded: (goal: Goal) => void;
  onCancel: () => void;
}

export default function AddGoalForm({ onGoalAdded, onCancel }: AddGoalFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a goal name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: character } = await supabase
        .from('characters')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!character) throw new Error('Character not found');

      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          character_id: character.id,
          name: name.trim(),
          description: description.trim(),
          target_value: targetValue,
          unit: unit.trim(),
          deadline: deadline || null,
          status: 'not_started'
        })
        .select()
        .single();

      if (goalError) throw goalError;
      if (!goal) throw new Error('Failed to create goal');

      onGoalAdded(goal);
      setName('');
      setDescription('');
      setTargetValue(1);
      setUnit('');
      setDeadline('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-rpg-light mb-2">Goal Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rpg-input w-full"
          placeholder="Enter goal name"
        />
      </div>

      <div>
        <label className="block text-rpg-light mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rpg-input w-full h-24"
          placeholder="Describe your goal"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-rpg-light mb-2">Target Value</label>
          <input
            type="number"
            min="1"
            value={targetValue}
            onChange={(e) => setTargetValue(parseInt(e.target.value))}
            className="rpg-input w-full"
          />
        </div>

        <div>
          <label className="block text-rpg-light mb-2">Unit</label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rpg-input w-full"
            placeholder="e.g., pages, miles, hours"
          />
        </div>
      </div>

      <div>
        <label className="block text-rpg-light mb-2">Deadline (Optional)</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rpg-input w-full"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {error && (
        <div className="text-red-500 text-center">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="rpg-button-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rpg-button-primary"
        >
          {loading ? 'Creating...' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
}
