import { useState } from 'react';
import { AdminLog } from '../../types/admin';

interface AdminLogsProps {
  logs?: AdminLog[];
}

export default function AdminLogs({ logs }: AdminLogsProps) {
  const [filter, setFilter] = useState<string>('all');

  if (!logs) {
    return (
      <div className="game-card p-6">
        <h2 className="text-xl font-bold mb-4">Admin Activity Logs</h2>
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

  const getActionColor = (action: string) => {
    switch (action) {
      case 'add_admin':
        return 'bg-green-500/20 text-green-400';
      case 'remove_admin':
        return 'bg-red-500/20 text-red-400';
      case 'update_settings':
        return 'bg-blue-500/20 text-blue-400';
      case 'moderate_user':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-white/20 text-white/60';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add_admin':
        return 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z';
      case 'remove_admin':
        return 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6';
      case 'update_settings':
        return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
      case 'moderate_user':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.action === filter);

  return (
    <div className="game-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Admin Activity Logs</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="game-input"
          >
            <option value="all">All Actions</option>
            <option value="add_admin">Add Admin</option>
            <option value="remove_admin">Remove Admin</option>
            <option value="update_settings">Update Settings</option>
            <option value="moderate_user">Moderate User</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="game-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={getActionIcon(log.action)}
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{log.admin_email}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                  {log.details && (
                    <div className="mt-2 text-sm text-white/80">
                      <pre className="whitespace-pre-wrap font-mono bg-black/20 p-2 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center text-white/60 py-8">
          No logs found for the selected filter.
        </div>
      )}
    </div>
  );
}
