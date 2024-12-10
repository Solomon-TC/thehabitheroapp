import Stripe from 'stripe';
import { buffer } from 'micro';
import { NextApiRequest } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export const handleStripeWebhook = async (req: NextApiRequest) => {
  const sig = req.headers['stripe-signature']!;
  const buf = await buffer(req);

  try {
    const event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle successful payment
        break;
      // Add other webhook events as needed
    }

    return { received: true };
  } catch (err) {
    console.error('Error processing webhook:', err);
    throw new Error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

export { stripe };
