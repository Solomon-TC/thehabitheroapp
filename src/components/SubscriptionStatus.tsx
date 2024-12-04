import React from 'react';
import { useRouter } from 'next/router';
import { getStripeCustomer, createCheckoutSession, createPortalSession } from '../lib/stripe';
import { useNotification } from '../contexts/NotificationContext';

interface SubscriptionStatusProps {
  status: 'active' | 'inactive';
  userId: string;
}

export default function SubscriptionStatus({ status, userId }: SubscriptionStatusProps) {
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleSubscribe = async () => {
    try {
      const session = await createCheckoutSession(userId);
      if (session.url) {
        router.push(session.url);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      showNotification('Failed to start subscription process', 'error');
    }
  };

  const handleManageSubscription = async () => {
    try {
      const session = await createPortalSession(userId);
      if (session.url) {
        router.push(session.url);
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      showNotification('Failed to open subscription management', 'error');
    }
  };

  return (
    <div className="game-card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Subscription Status</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            status === 'active'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>

      {status === 'active' ? (
        <div className="space-y-4">
          <p className="text-white/60">
            Your subscription is active. You have access to all premium features.
          </p>
          <button
            onClick={handleManageSubscription}
            className="game-button w-full"
          >
            Manage Subscription
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-white/60">
              Subscribe to unlock premium features:
            </p>
            <ul className="list-disc list-inside text-white/60 space-y-1">
              <li>Advanced habit tracking</li>
              <li>Detailed progress analytics</li>
              <li>Custom character themes</li>
              <li>Friend challenges</li>
              <li>Priority support</li>
            </ul>
          </div>
          <button
            onClick={handleSubscribe}
            className="game-button w-full bg-gradient-to-r from-primary-500 to-primary-600"
          >
            Subscribe Now
          </button>
        </div>
      )}
    </div>
  );
}
