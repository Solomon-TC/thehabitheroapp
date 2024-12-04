import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  const handleGetStarted = () => {
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-64 h-64 -top-32 -left-32 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <h1 className="game-title text-2xl">HabitQuest</h1>
              </div>
              <button
                onClick={handleGetStarted}
                className="game-button"
              >
                Sign In
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h2 className="game-title text-4xl sm:text-5xl md:text-6xl mb-8">
              <span className="block">Level Up Your Life</span>
              <span className="block mt-2 text-primary-400">One Habit at a Time</span>
            </h2>
            <p className="mt-3 max-w-md mx-auto text-lg text-white/80 sm:text-xl md:mt-5 md:max-w-3xl">
              Transform your daily habits into an epic adventure. Build your character, gain experience, and unlock achievements as you progress in real life.
            </p>

            {/* Feature Cards */}
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="game-card p-6 float-animation">
                <div className="h-12 w-12 mx-auto mb-4 rounded-lg bg-primary-500 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
                <p className="text-white/70">Watch your character grow as you maintain good habits and achieve goals</p>
              </div>

              <div className="game-card p-6 float-animation delay-100">
                <div className="h-12 w-12 mx-auto mb-4 rounded-lg bg-game-exp flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Earn Rewards</h3>
                <p className="text-white/70">Unlock achievements and customize your character as you progress</p>
              </div>

              <div className="game-card p-6 float-animation delay-200 sm:col-span-2 lg:col-span-1">
                <div className="h-12 w-12 mx-auto mb-4 rounded-lg bg-game-mana flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Build Streaks</h3>
                <p className="text-white/70">Maintain your habits and watch your streaks grow day by day</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-16">
              <button
                onClick={handleGetStarted}
                className="game-button text-lg px-8 py-3 shadow-xl hover:shadow-2xl"
              >
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/60">
            © {new Date().getFullYear()} HabitQuest. Level up your life.
          </p>
        </div>
      </footer>
    </div>
  );
}
