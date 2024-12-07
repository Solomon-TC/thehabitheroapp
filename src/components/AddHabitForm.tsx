import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Habit, CORE_ATTRIBUTES, CoreAttribute } from '../types';
import { useNotification } from '../contexts/NotificationContext';

export default function AddHabitForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
  const [selectedAttribute, setSelectedAttribute] = useState<CoreAttribute>('strength');
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('habits')
        .insert([
          {
            user_id: user.id,
            title,
            description,
            frequency,
            attribute: selectedAttribute,
          },
        ]);

      if (error) throw error;

      showNotification('Habit created successfully!', 'success');
      
      // Clear form
      setTitle('');
      setDescription('');
      setFrequency('daily');
      setSelectedAttribute('strength');
      
    } catch (error) {
      console.error('Error adding habit:', error);
      showNotification('Failed to create habit', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Habit Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
          Frequency
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Habit['frequency'])}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <label htmlFor="attribute" className="block text-sm font-medium text-gray-700">
          Associated Attribute
        </label>
        <select
          id="attribute"
          value={selectedAttribute}
          onChange={(e) => setSelectedAttribute(e.target.value as CoreAttribute)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.entries(CORE_ATTRIBUTES).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Adding...' : 'Add Habit'}
      </button>
    </form>
  );
}
