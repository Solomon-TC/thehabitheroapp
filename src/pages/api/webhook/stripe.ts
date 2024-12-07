import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import { stripe, handleStripeWebhook } from '../../../lib/stripe';

// Disable body parsing, need raw body for Stripe webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    await handleStripeWebhook(signature, rawBody);

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}
