import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import type { Habit, Goal, HabitLog } from '../types';

type AttributeType = 'strength' | 'agility' | 'wisdom' | 'creativity';
type AttributeGains = Record<AttributeType, number>;

interface WeeklyProgress {
  weekStart: string;
  weekEnd: string;
  habitsCompleted: number;
  totalHabits: number;
  completionRate: number;
  experienceGained: number;
  goalsCompleted: number;
  attributeGains: AttributeGains;
}

export default function ProgressReport() {
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the last 4 weeks of data
      const weeks = [];
      for (let i = 0; i < 4; i++) {
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);

        // Fetch habits data
        const { data: habits } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .lte('created_at', weekEnd.toISOString());

        // Fetch habit logs for the week
        const { data: habitLogs } = await supabase
          .from('habit_logs')
          .select('*')
          .gte('completed_at', weekStart.toISOString())
          .lte('completed_at', weekEnd.toISOString());

        // Fetch completed goals for the week
        const { data: completedGoals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString());

        // Calculate attribute gains
        const attributeGains: AttributeGains = {
          strength: 0,
          agility: 0,
          wisdom: 0,
          creativity: 0
        };

        habitLogs?.forEach(log => {
          const habit = habits?.find(h => h.id === log.habit_id);
          if (habit && habit.attribute_type) {
            attributeGains[habit.attribute_type as AttributeType] += 1;
          }
        });

        weeks.push({
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          habitsCompleted: habitLogs?.length || 0,
          totalHabits: habits?.length || 0,
          completionRate: habits?.length ? ((habitLogs?.length || 0) / habits.length) * 100 : 0,
          experienceGained: habitLogs?.reduce((sum, log) => sum + (log.experience_gained || 0), 0) || 0,
          goalsCompleted: completedGoals?.length || 0,
          attributeGains
        });
      }

      setWeeklyProgress(weeks);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Weekly Progress Report</h1>

        <div className="space-y-8">
          {weeklyProgress.map((week, index) => (
            <div key={week.weekStart} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {index === 0 ? 'This Week' : index === 1 ? 'Last Week' : `${index} Weeks Ago`}
                </h2>
                <span className="text-sm text-gray-500">
                  {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Habit Completion */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Habit Completion</h3>
                  <div className="text-2xl font-bold text-blue-900">
                    {week.completionRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    {week.habitsCompleted} / {week.totalHabits} habits
                  </p>
                </div>

                {/* Experience Gained */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Experience Gained</h3>
                  <div className="text-2xl font-bold text-green-900">
                    {week.experienceGained} XP
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {Math.floor(week.experienceGained / 100)} levels gained
                  </p>
                </div>

                {/* Goals Completed */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-800 mb-2">Goals Completed</h3>
                  <div className="text-2xl font-bold text-purple-900">
                    {week.goalsCompleted}
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    achievements unlocked
                  </p>
                </div>

                {/* Attribute Progress */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Attribute Gains</h3>
                  <div className="space-y-1">
                    {(Object.entries(week.attributeGains) as [AttributeType, number][]).map(([attr, gain]) => (
                      <div key={attr} className="flex justify-between text-sm">
                        <span className="capitalize text-yellow-700">{attr}</span>
                        <span className="font-medium text-yellow-900">+{gain}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {weeklyProgress.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No progress data available yet. Start completing habits and goals to see your progress!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
