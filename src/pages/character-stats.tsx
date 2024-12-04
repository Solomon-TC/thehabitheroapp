import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import type { Character, HabitLog } from '../types';

interface StatPeriod {
  habits_completed: number;
  experience_gained: number;
  levels_gained: number;
  start_date: string;
  end_date: string;
}

interface AttributeProgress {
  name: string;
  initial: number;
  current: number;
  percentage: number;
}

type AttributeType = 'strength' | 'agility' | 'wisdom' | 'creativity';

export default function CharacterStats() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<StatPeriod | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<StatPeriod | null>(null);
  const [attributeProgress, setAttributeProgress] = useState<AttributeProgress[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacterData();
  }, []);

  const fetchCharacterData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch character data
      const { data: characterData, error: characterError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (characterError) throw characterError;
      setCharacter(characterData);

      // Calculate weekly stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weeklyLogs, error: weeklyError } = await supabase
        .from('habit_logs')
        .select('*')
        .gte('completed_at', weekAgo.toISOString())
        .order('completed_at', { ascending: false });

      if (weeklyError) throw weeklyError;

      setWeeklyStats({
        habits_completed: weeklyLogs?.length || 0,
        experience_gained: weeklyLogs?.reduce((sum, log) => sum + (log.experience_gained || 0), 0) || 0,
        levels_gained: Math.floor((weeklyLogs?.reduce((sum, log) => sum + (log.experience_gained || 0), 0) || 0) / 100),
        start_date: weekAgo.toISOString(),
        end_date: new Date().toISOString()
      });

      // Calculate attribute progress
      if (characterData) {
        const progress: AttributeProgress[] = (Object.entries(characterData.attributes) as [AttributeType, number][]).map(
          ([name, current]) => ({
            name,
            initial: 1,
            current,
            percentage: ((current - 1) / 9) * 100 // Assuming max level is 10
          })
        );
        setAttributeProgress(progress);

        // Get recent achievements
        setRecentAchievements(characterData.appearance.achievements.slice(-5));
      }

    } catch (error) {
      console.error('Error fetching character stats:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Character Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Character Overview</h2>
            {character && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium">{character.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">{character.experience} XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Character Type</span>
                  <span className="font-medium capitalize">{character.character_type}</span>
                </div>
              </div>
            )}
          </div>

          {/* Weekly Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">This Week's Progress</h2>
            {weeklyStats && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Habits Completed</span>
                  <span className="font-medium">{weeklyStats.habits_completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Experience Gained</span>
                  <span className="font-medium">{weeklyStats.experience_gained} XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Levels Gained</span>
                  <span className="font-medium">{weeklyStats.levels_gained}</span>
                </div>
              </div>
            )}
          </div>

          {/* Attribute Progress */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Attribute Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {attributeProgress.map((attr) => (
                <div key={attr.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 capitalize">{attr.name}</span>
                    <span className="font-medium">{attr.current} / 10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${attr.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    Improved by {attr.current - attr.initial} points
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Achievements</h2>
            {recentAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentAchievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-900">{achievement}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No achievements yet</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
