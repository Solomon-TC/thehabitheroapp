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

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link 
      href={href}
      className={`nav-link ${isActive(href) ? 'active' : ''}`}
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link 
      href={href}
      className={`nav-link-mobile ${isActive(href) ? 'active' : ''}`}
    >
      {children}
    </Link>
  );

  return (
    <header className="bg-rpg-dark border-b border-rpg-accent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-2xl font-pixel text-rpg-primary">
              HabitQuest
            </Link>
            
            <nav className="hidden md:flex space-x-4">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/manage">Quests</NavLink>
              <NavLink href="/progress-report">Progress</NavLink>
              <NavLink href="/friends">Friends</NavLink>
              <NavLink href="/feedback">Feedback</NavLink>
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
            <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
            <MobileNavLink href="/manage">Quests</MobileNavLink>
            <MobileNavLink href="/progress-report">Progress</MobileNavLink>
            <MobileNavLink href="/friends">Friends</MobileNavLink>
            <MobileNavLink href="/feedback">Feedback</MobileNavLink>
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
