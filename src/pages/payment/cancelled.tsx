import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNotification } from '../../contexts/NotificationContext';

export default function PaymentCancelledPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    showNotification('Payment process was cancelled', 'info');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center">
      <div className="game-card p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <svg
            className="w-16 h-16 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">Payment Cancelled</h1>
        
        <p className="text-white/60">
          Your payment process was cancelled. No charges were made to your account.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/subscription')}
            className="game-button w-full bg-gradient-to-r from-primary-500 to-primary-600"
          >
            Try Again
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="game-button w-full bg-white/10 hover:bg-white/20"
          >
            Return to Dashboard
          </button>
        </div>

        <p className="text-sm text-white/40">
          If you have any questions or concerns, please don't hesitate to contact our support team.
        </p>
      </div>
    </div>
  );
}
