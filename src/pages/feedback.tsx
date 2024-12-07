import { useState } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', content: '' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            user_id: user?.id,
            category,
            feedback,
            email: user?.email,
          },
        ]);

      if (error) throw error;

      setMessage({ type: 'success', content: 'Thank you for your feedback!' });
      setFeedback('');
      setCategory('general');
    } catch (error: any) {
      setMessage({ type: 'error', content: 'Error submitting feedback. Please try again.' });
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Send Feedback</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="improvement">Improvement Suggestion</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Your Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Tell us what you think about the app, report a bug, or suggest improvements..."
              required
            />
          </div>

          {message.content && (
            <div
              className={`p-4 rounded-md ${
                message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}
            >
              {message.content}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !feedback.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
