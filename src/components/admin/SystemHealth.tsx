import { SystemHealth as SystemHealthType } from '../../types/admin';

interface SystemHealthProps {
  health?: SystemHealthType;
}

export default function SystemHealth({ health }: SystemHealthProps) {
  if (!health) {
    return (
      <div className="game-card p-6">
        <h2 className="text-xl font-bold mb-4">System Health</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return '';
    }
  };

  const metrics = [
    {
      label: 'Database Status',
      value: health.database_status,
      icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
      status: health.database_status,
    },
    {
      label: 'API Status',
      value: health.api_status,
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      status: health.api_status,
    },
    {
      label: 'Active Connections',
      value: health.active_connections,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      status: health.active_connections > 1000 ? 'warning' : 'healthy',
    },
    {
      label: 'Response Time',
      value: `${health.average_response_time}ms`,
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      status: health.average_response_time > 500 ? 'warning' : 'healthy',
    },
  ];

  return (
    <div className="game-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">System Health</h2>
        <div className="text-sm text-white/60">
          Last backup: {new Date(health.last_backup).toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="game-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${getStatusColor(metric.status as any)}`}>
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={metric.icon}
                  />
                </svg>
              </div>
              <div className={`h-3 w-3 rounded-full ${getStatusColor(metric.status as any)}`}></div>
            </div>
            <div className="mt-2">
              <span className="text-lg font-bold">{metric.value}</span>
              <span className="block text-sm text-white/60 mt-1">{metric.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex space-x-4">
        <button className="game-button">
          Force Backup
        </button>
        <button className="game-button bg-yellow-500 hover:bg-yellow-600">
          Clear Cache
        </button>
        <button className="game-button bg-red-500 hover:bg-red-600">
          Reset Connections
        </button>
      </div>
    </div>
  );
}
