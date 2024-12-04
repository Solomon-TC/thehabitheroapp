import { AdminStats as AdminStatsType } from '../../types/admin';

interface AdminStatsProps {
  stats?: AdminStatsType;
}

export default function AdminStats({ stats }: AdminStatsProps) {
  if (!stats) {
    return (
      <div className="game-card p-6">
        <h2 className="text-xl font-bold mb-4">System Statistics</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.total_users,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      color: 'bg-primary-500',
    },
    {
      label: 'Active Users',
      value: stats.active_users,
      percentage: ((stats.active_users / stats.total_users) * 100).toFixed(1) + '%',
      icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-green-500',
    },
    {
      label: 'Total Habits',
      value: stats.total_habits,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'bg-blue-500',
    },
    {
      label: 'Total Goals',
      value: stats.total_goals,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'bg-purple-500',
    },
    {
      label: 'Completed Habits',
      value: stats.completed_habits,
      percentage: ((stats.completed_habits / stats.total_habits) * 100).toFixed(1) + '%',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-yellow-500',
    },
    {
      label: 'Completed Goals',
      value: stats.completed_goals,
      percentage: ((stats.completed_goals / stats.total_goals) * 100).toFixed(1) + '%',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-pink-500',
    },
    {
      label: 'Average Level',
      value: stats.average_user_level.toFixed(1),
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="game-card p-6">
      <h2 className="text-xl font-bold mb-4">System Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="game-card p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.color}`}>
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
                    d={stat.icon}
                  />
                </svg>
              </div>
              {stat.percentage && (
                <span className="text-sm text-white/60">{stat.percentage}</span>
              )}
            </div>
            <div className="mt-2">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className="block text-sm text-white/60 mt-1">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
