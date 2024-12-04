import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import type { UserReport } from '../../types/admin';

interface UserManagementProps {
  users?: UserReport[];
  onRefresh: () => void;
}

export default function UserManagement({ users, onRefresh }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleAddAdmin = async (userId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('add_admin', {
        admin_email: users?.find(u => u.user_id === userId)?.email,
        added_by: user.id
      });

      if (error) throw error;

      showNotification('Admin role assigned successfully', 'success');
      onRefresh();
    } catch (error) {
      console.error('Error adding admin:', error);
      showNotification('Failed to assign admin role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('remove_admin', {
        admin_email: users?.find(u => u.user_id === userId)?.email,
        removed_by: user.id
      });

      if (error) throw error;

      showNotification('Admin role removed successfully', 'success');
      onRefresh();
    } catch (error) {
      console.error('Error removing admin:', error);
      showNotification('Failed to remove admin role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      setLoading(true);
      // Implement user suspension logic
      showNotification('User suspended successfully', 'success');
      onRefresh();
    } catch (error) {
      console.error('Error suspending user:', error);
      showNotification('Failed to suspend user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!users) {
    return (
      <div className="game-card p-6">
        <h2 className="text-xl font-bold mb-4">User Management</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-white/10 rounded-lg"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-card p-6">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="game-input w-full"
        />
      </div>

      {/* User List */}
      <div className="space-y-4">
        {filteredUsers?.map((user) => (
          <div key={user.user_id} className="game-card p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{user.email}</span>
                {user.is_active && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                    Active
                  </span>
                )}
              </div>
              <div className="text-sm text-white/60 mt-1">
                <span>Level {user.character_level}</span>
                <span className="mx-2">•</span>
                <span>{user.total_habits} habits</span>
                <span className="mx-2">•</span>
                <span>{user.total_goals} goals</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAddAdmin(user.user_id)}
                disabled={loading}
                className="game-button bg-primary-500 hover:bg-primary-600"
              >
                Make Admin
              </button>
              <button
                onClick={() => handleRemoveAdmin(user.user_id)}
                disabled={loading}
                className="game-button bg-yellow-500 hover:bg-yellow-600"
              >
                Remove Admin
              </button>
              <button
                onClick={() => handleSuspendUser(user.user_id)}
                disabled={loading}
                className="game-button bg-red-500 hover:bg-red-600"
              >
                Suspend
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers?.length === 0 && (
        <div className="text-center text-white/60 py-8">
          No users found matching your search.
        </div>
      )}
    </div>
  );
}
