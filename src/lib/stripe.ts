import Stripe from 'stripe';
import { NextApiRequest } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
});

export const handleStripeWebhook = async (req: NextApiRequest) => {
  const sig = req.headers['stripe-signature']!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription changes
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { status: 200, message: 'Webhook processed successfully' };
  } catch (err) {
    console.error('Error processing webhook:', err);
    throw err;
  }
};

export const createCheckoutSession = async (priceId: string, customerId: string) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
    });

    return session;
  } catch (err) {
    console.error('Error creating checkout session:', err);
    throw err;
  }
};

export const createCustomerPortalSession = async (customerId: string) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    });

    return session;
  } catch (err) {
    console.error('Error creating customer portal session:', err);
    throw err;
  }
};

export const getSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (err) {
    console.error('Error retrieving subscription:', err);
    throw err;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (err) {
    console.error('Error cancelling subscription:', err);
    throw err;
  }
};

export default stripe;
