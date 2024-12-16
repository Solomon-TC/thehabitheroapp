import { useState, useEffect } from 'react';
import { getUserHabits, completeHabit } from '../utils/database';
import type { Habit } from '../types/database';

interface HabitListProps {
  onHabitCompleted: () => void;
}

export default function HabitList({ onHabitCompleted }: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await getUserHabits();
      setHabits(data);
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (habitId: string) => {
    try {
      setCompletingHabit(habitId);
      await completeHabit(habitId);
      await loadHabits();
      onHabitCompleted();
      
      // Show completion animation
      const element = document.getElementById(`habit-${habitId}`);
      if (element) {
        element.classList.add('animate-level-up');
        setTimeout(() => {
          element.classList.remove('animate-level-up');
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setCompletingHabit(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rpg-border h-24"></div>
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 rpg-panel">
        <p className="text-rpg-light-darker font-pixel">No active quests</p>
        <p className="text-sm text-rpg-light-darker mt-2">Add a new daily quest to begin your journey</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const isCompleting = completingHabit === habit.id;
        const today = new Date().toISOString().split('T')[0];
        const isCompletedToday = habit.last_completed?.startsWith(today);

        return (
          <div
            key={habit.id}
            id={`habit-${habit.id}`}
            className={`quest-card transform transition-all duration-300 ${
              isCompletedToday ? 'opacity-75' : 'hover:scale-102'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-rpg-light">
                  {habit.name}
                </h3>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="stat-badge text-xs">
                    {habit.frequency}
                  </span>
                  {habit.streak > 0 && (
                    <span className="stat-badge bg-gradient-to-r from-rarity-rare to-rarity-epic text-xs">
                      🔥 {habit.streak} day streak
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleComplete(habit.id)}
                disabled={isCompleting || isCompletedToday}
                className={`rpg-button min-w-[120px] ${
                  isCompletedToday
                    ? 'bg-rpg-success cursor-default'
                    : 'hover:scale-105 transform transition'
                }`}
              >
                {isCompleting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                  </div>
                ) : isCompletedToday ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Complete
                  </span>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${(habit.streak / habit.target_days) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-rpg-light-darker mt-1">
                <span>{habit.streak} / {habit.target_days} days</span>
                <span>{Math.round((habit.streak / habit.target_days) * 100)}% complete</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
