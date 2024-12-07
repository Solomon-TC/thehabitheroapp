import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const currentPath = router.pathname;
  const [unreadFeedback, setUnreadFeedback] = useState(0);

  useEffect(() => {
    fetchUnreadFeedback();
    subscribeToFeedback();
  }, []);

  const fetchUnreadFeedback = async () => {
    try {
      const { data, error } = await supabase.rpc('get_unread_feedback_count');
      if (error) throw error;
      setUnreadFeedback(data || 0);
    } catch (error) {
      console.error('Error fetching unread feedback:', error);
    }
  };

  const subscribeToFeedback = () => {
    const feedbackSubscription = supabase
      .channel('feedback_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback'
        },
        () => {
          fetchUnreadFeedback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackSubscription);
    };
  };

  const navigationItems = [
    { 
      href: '/admin', 
      label: 'Dashboard', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    { 
      href: '/admin/users', 
      label: 'Users', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    },
    { 
      href: '/admin/feedback', 
      label: 'Feedback', 
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      badge: unreadFeedback
    },
    { 
      href: '/admin/settings', 
      label: 'Settings', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    },
    { 
      href: '/admin/logs', 
      label: 'Logs', 
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end">
      {/* Admin Header */}
      <header className="bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-red-500">Admin Panel</span>
            </div>
            <Link href="/dashboard" className="text-white/80 hover:text-white">
              Return to App
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-12 lg:col-span-2">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    currentPath === item.href
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
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
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-10 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
