import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.push('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const customTheme = {
    default: {
      colors: {
        brand: '#009fff',
        brandAccent: '#0077cc',
        brandButtonText: 'white',
        defaultButtonBackground: 'transparent',
        defaultButtonBackgroundHover: '#ffffff20',
        defaultButtonBorder: '#ffffff30',
        defaultButtonText: 'white',
        dividerBackground: '#ffffff20',
        inputBackground: 'transparent',
        inputBorder: '#ffffff30',
        inputBorderHover: '#ffffff50',
        inputBorderFocus: '#009fff',
        inputText: 'white',
        inputPlaceholder: '#ffffff80',
      },
      space: {
        spaceSmall: '4px',
        spaceMedium: '8px',
        spaceLarge: '16px',
      },
      fonts: {
        bodyFontFamily: `'Rubik', sans-serif`,
        buttonFontFamily: `'Rubik', sans-serif`,
        inputFontFamily: `'Rubik', sans-serif`,
        labelFontFamily: `'Rubik', sans-serif`,
      },
      borderWidths: {
        buttonBorderWidth: '1px',
        inputBorderWidth: '1px',
      },
      radii: {
        borderRadiusButton: '8px',
        buttonBorderRadius: '8px',
        inputBorderRadius: '8px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end text-white">
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
          </div>
        </div>
      </nav>

      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="game-card w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h2 className="game-title text-2xl mb-4">Begin Your Adventure</h2>
            <p className="text-white/80">Join the quest to level up your life through better habits</p>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: customTheme
            }}
            theme="dark"
            providers={['google', 'github']}
            redirectTo={`${window.location.origin}/dashboard`}
            socialLayout="horizontal"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Your Email',
                  password_label: 'Your Secret Key',
                  button_label: 'Continue Quest',
                },
                sign_up: {
                  email_label: 'Choose Your Email',
                  password_label: 'Create Secret Key',
                  button_label: 'Begin Adventure',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/60">
            © {new Date().getFullYear()} HabitQuest. Level up your life.
          </p>
        </div>
      </footer>
    </div>
  );
}
