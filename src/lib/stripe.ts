import Stripe from 'stripe';
import { NextApiRequest } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
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
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle successful payment
        await handleSuccessfulPayment(session);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  } catch (err) {
    console.error('Error processing webhook:', err);
    throw new Error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

const handleSuccessfulPayment = async (session: Stripe.Checkout.Session) => {
  // Update user's subscription status in database
  // This is where you would update the user's subscription status in your database
  console.log('Processing successful payment for session:', session.id);
};

export const createCheckoutSession = async (priceId: string, userId: string) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
    metadata: {
      userId,
    },
  });

  return session;
};

export const createPortalSession = async (customerId: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
  });

  return session;
};

export default stripe;
