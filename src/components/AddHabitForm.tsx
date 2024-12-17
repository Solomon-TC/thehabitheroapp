import { useState } from 'react';
import { createClient } from '../lib/supabase';
import type { Habit } from '../types/database';

interface AddHabitFormProps {
  onHabitAdded: (habit: Habit) => void;
  onCancel: () => void;
}

export default function AddHabitForm({ onHabitAdded, onCancel }: AddHabitFormProps) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [targetDays, setTargetDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a habit name');
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

      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          character_id: character.id,
          name: name.trim(),
          frequency,
          target_days: targetDays,
        })
        .select()
        .single();

      if (habitError) throw habitError;
      if (!habit) throw new Error('Failed to create habit');

      onHabitAdded(habit);
      setName('');
      setFrequency('daily');
      setTargetDays(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-rpg-light mb-2">Habit Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rpg-input w-full"
          placeholder="Enter habit name"
        />
      </div>

      <div>
        <label className="block text-rpg-light mb-2">Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="rpg-select w-full"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <label className="block text-rpg-light mb-2">Target Days</label>
        <input
          type="number"
          min="1"
          max="31"
          value={targetDays}
          onChange={(e) => setTargetDays(parseInt(e.target.value))}
          className="rpg-input w-full"
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
          {loading ? 'Creating...' : 'Create Habit'}
        </button>
      </div>
    </form>
  );
}
