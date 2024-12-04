import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import AdminLayout from '../../components/admin/AdminLayout';
import FeedbackManagement from '../../components/admin/FeedbackManagement';

interface FeedbackSummary {
  total_feedback: number;
  new_feedback: number;
  in_progress_feedback: number;
  resolved_feedback: number;
  avg_resolution_time: string;
}

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

export default function AdminFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    try {
      // Fetch feedback summary
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_feedback_summary');

      if (summaryError) throw summaryError;

      // Fetch feedback with user details
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          *,
          profiles:user_id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Transform feedback data
      const transformedFeedback = feedbackData.map(item => ({
        ...item,
        user_email: item.profiles.email
      }));

      setSummary(summaryData);
      setFeedback(transformedFeedback);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      showNotification('Failed to load feedback data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time feedback updates
  useEffect(() => {
    const feedbackSubscription = supabase
      .channel('feedback_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback'
        },
        () => {
          fetchFeedbackData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackSubscription);
    };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!summary) {
    return (
      <AdminLayout>
        <div className="text-center text-white/60 py-8">
          Error loading feedback data. Please try again.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Feedback Management</h1>
          <button
            onClick={fetchFeedbackData}
            className="game-button"
          >
            Refresh
          </button>
        </div>

        <FeedbackManagement
          feedback={feedback}
          summary={summary}
          onRefresh={fetchFeedbackData}
        />
      </div>
    </AdminLayout>
  );
}
