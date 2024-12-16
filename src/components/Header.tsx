import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '../lib/supabase';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUsername(profile.username);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const isActive = (path: string) => router.pathname === path;

  return (
    <header className="bg-rpg-dark border-b border-rpg-accent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-pixel text-rpg-primary">
              HabitQuest
            </Link>
            
            <nav className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                href="/progress-report"
                className={`nav-link ${isActive('/progress-report') ? 'active' : ''}`}
              >
                Progress
              </Link>
              <Link
                href="/friends"
                className={`nav-link ${isActive('/friends') ? 'active' : ''}`}
              >
                Friends
              </Link>
              <Link
                href="/feedback"
                className={`nav-link ${isActive('/feedback') ? 'active' : ''}`}
              >
                Feedback
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {username && (
              <div className="text-rpg-light">
                Welcome, <span className="font-pixel">{username}</span>
              </div>
            )}
            <div className="flex space-x-2">
              <Link
                href="/account"
                className={`rpg-button-secondary ${isActive('/account') ? 'active' : ''}`}
              >
                Account
              </Link>
              <button
                onClick={handleSignOut}
                className="rpg-button-ghost"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard"
              className={`nav-link-mobile ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              href="/progress-report"
              className={`nav-link-mobile ${isActive('/progress-report') ? 'active' : ''}`}
            >
              Progress
            </Link>
            <Link
              href="/friends"
              className={`nav-link-mobile ${isActive('/friends') ? 'active' : ''}`}
            >
              Friends
            </Link>
            <Link
              href="/feedback"
              className={`nav-link-mobile ${isActive('/feedback') ? 'active' : ''}`}
            >
              Feedback
            </Link>
          </div>
        </nav>
      </div>

      <style jsx>{`
        .nav-link {
          @apply text-rpg-light-darker hover:text-rpg-light transition-colors duration-200 px-3 py-2 rounded-md;
        }
        .nav-link.active {
          @apply text-rpg-primary font-semibold bg-rpg-dark-lighter;
        }
        .nav-link-mobile {
          @apply text-center text-rpg-light-darker hover:text-rpg-light transition-colors duration-200 px-3 py-2 rounded-md;
        }
        .nav-link-mobile.active {
          @apply text-rpg-primary font-semibold bg-rpg-dark-lighter;
        }
      `}</style>
    </header>
  );
}
