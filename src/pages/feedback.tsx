import { useState } from 'react';
import { createClient } from '../lib/supabase';
import AuthWrapper from '../components/AuthWrapper';

function FeedbackPage() {
  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState<'bug' | 'feature' | 'general'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Please enter your feedback');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          content: feedback,
          type: type,
        });

      if (feedbackError) throw feedbackError;

      setSuccess(true);
      setFeedback('');
      setType('general');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-pixel text-rpg-primary mb-8">Share Your Thoughts</h1>

      <div className="rpg-panel max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-rpg-light mb-2">Feedback Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'bug' | 'feature' | 'general')}
              className="rpg-select w-full"
            >
              <option value="general">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
            </select>
          </div>

          <div>
            <label className="block text-rpg-light mb-2">Your Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="rpg-input w-full h-32"
              placeholder="Share your thoughts, report bugs, or suggest new features..."
            />
          </div>

          {error && (
            <div className="text-red-500 text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-500 text-center">
              Thank you for your feedback!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rpg-button-primary w-full"
          >
            {loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FeedbackPageWrapper() {
  return (
    <AuthWrapper>
      <FeedbackPage />
    </AuthWrapper>
  );
}
