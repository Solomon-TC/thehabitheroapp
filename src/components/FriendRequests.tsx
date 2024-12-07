import { FriendRequest } from '../types';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface FriendRequestsProps {
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

interface RequestWithUser extends FriendRequest {
  sender_email?: string;
}

export default function FriendRequests({ requests, onAccept, onReject }: FriendRequestsProps) {
  const [requestsWithUsers, setRequestsWithUsers] = useState<RequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequestUsers();
  }, [requests]);

  const fetchRequestUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const userId = request.user_id === user.id ? request.friend_id : request.user_id;
          const { data } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();

          return {
            ...request,
            sender_email: data?.email
          };
        })
      );

      setRequestsWithUsers(enrichedRequests);
    } catch (error) {
      console.error('Error fetching request users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="game-card p-6">
        <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (requestsWithUsers.length === 0) {
    return (
      <div className="game-card p-6">
        <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
        <p className="text-white/60 text-center">No pending friend requests</p>
      </div>
    );
  }

  return (
    <div className="game-card p-6">
      <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
      <div className="space-y-4">
        {requestsWithUsers.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-4 game-card">
            <div>
              <p className="font-medium">{request.sender_email}</p>
              <p className="text-sm text-white/60">Sent {new Date(request.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onAccept(request.id)}
                className="game-button bg-green-500 hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="game-button bg-red-500 hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
