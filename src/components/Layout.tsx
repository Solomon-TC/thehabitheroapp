import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user && !loading) {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, loading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navigationItems = [
    { href: '/dashboard', label: 'Quest Board', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/character-stats', label: 'Character', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { href: '/progress-report', label: 'Progress', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { href: '/friends', label: 'Friends', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { href: '/account', label: 'Account', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { href: '/feedback', label: 'Feedback', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-64 h-64 -top-32 -left-32 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <h1 className="game-title text-2xl">HabitQuest</h1>
              </Link>
              {user && (
                <div className="hidden md:flex ml-10 space-x-8">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-link flex items-center space-x-2 ${
                        router.pathname === item.href ? 'active' : ''
                      }`}
                    >
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
                          d={item.icon}
                        />
                      </svg>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {user && (
              <div className="flex items-center">
                <div className="hidden md:flex items-center">
                  <span className="mr-4 text-white/80">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="game-button bg-accent-500 hover:bg-accent-600"
                  >
                    Leave Quest
                  </button>
                </div>
                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <span className="sr-only">Open main menu</span>
                    <svg
                      className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <svg
                      className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && user && (
          <div className="md:hidden border-t border-white/10 bg-gradient-start/80 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    router.pathname === item.href
                      ? 'bg-white/10 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
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
                      d={item.icon}
                    />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-accent-400 hover:bg-white/10"
              >
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Leave Quest</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
