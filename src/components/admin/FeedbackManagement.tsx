import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';

interface Feedback {
  id: string;
  user_id: string;
  user_email: string;
  category: 'bug' | 'feature' | 'improvement' | 'general';
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  response?: string;
  created_at: string;
  resolved_at?: string;
}

interface FeedbackSummary {
  total_feedback: number;
  new_feedback: number;
  in_progress_feedback: number;
  resolved_feedback: number;
  avg_resolution_time: string;
}

interface FeedbackManagementProps {
  feedback: Feedback[];
  summary: FeedbackSummary;
  onRefresh: () => void;
}

export default function FeedbackManagement({ feedback, summary, onRefresh }: FeedbackManagementProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Feedback['category']>('all');
  const { showNotification } = useNotification();

  const handleUpdateStatus = async (id: string, status: Feedback['status']) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      showNotification('Status updated successfully', 'success');
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Failed to update status', 'error');
    }
  };

  const handleSendResponse = async () => {
    if (!selectedFeedback || !response.trim()) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .update({ 
          response,
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', selectedFeedback.id);

      if (error) throw error;

      showNotification('Response sent successfully', 'success');
      setSelectedFeedback(null);
      setResponse('');
      onRefresh();
    } catch (error) {
      console.error('Error sending response:', error);
      showNotification('Failed to send response', 'error');
    }
  };

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-400';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
    }
  };

  const getCategoryColor = (category: Feedback['category']) => {
    switch (category) {
      case 'bug':
        return 'bg-red-500/20 text-red-400';
      case 'feature':
        return 'bg-purple-500/20 text-purple-400';
      case 'improvement':
        return 'bg-green-500/20 text-green-400';
      case 'general':
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const filteredFeedback = feedback.filter(f => {
    if (filter !== 'all' && f.status !== filter) return false;
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="game-card p-4">
          <div className="text-sm text-white/60">Total Feedback</div>
          <div className="text-2xl font-bold">{summary.total_feedback}</div>
        </div>
        <div className="game-card p-4">
          <div className="text-sm text-white/60">New</div>
          <div className="text-2xl font-bold text-blue-400">{summary.new_feedback}</div>
        </div>
        <div className="game-card p-4">
          <div className="text-sm text-white/60">In Progress</div>
          <div className="text-2xl font-bold text-yellow-400">{summary.in_progress_feedback}</div>
        </div>
        <div className="game-card p-4">
          <div className="text-sm text-white/60">Resolved</div>
          <div className="text-2xl font-bold text-green-400">{summary.resolved_feedback}</div>
        </div>
        <div className="game-card p-4">
          <div className="text-sm text-white/60">Avg. Resolution Time</div>
          <div className="text-2xl font-bold">{summary.avg_resolution_time}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="game-input"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as any)}
          className="game-input"
        >
          <option value="all">All Categories</option>
          <option value="bug">Bugs</option>
          <option value="feature">Feature Requests</option>
          <option value="improvement">Improvements</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((item) => (
          <div key={item.id} className="game-card p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-white/60">
                  From: {item.user_email}
                </div>
                <div className="mt-2">{item.message}</div>
                {item.response && (
                  <div className="mt-2 pl-4 border-l-2 border-primary-500">
                    <div className="text-sm text-white/60">Response:</div>
                    <div>{item.response}</div>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                {item.status !== 'resolved' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                      className="game-button bg-yellow-500 hover:bg-yellow-600"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => setSelectedFeedback(item)}
                      className="game-button"
                    >
                      Respond
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="game-card max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4">Respond to Feedback</h3>
            <div className="mb-4">
              <div className="text-sm text-white/60">Original Message:</div>
              <div className="mt-1">{selectedFeedback.message}</div>
            </div>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="game-input w-full h-32"
              placeholder="Type your response..."
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => {
                  setSelectedFeedback(null);
                  setResponse('');
                }}
                className="game-button bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSendResponse}
                className="game-button"
                disabled={!response.trim()}
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
