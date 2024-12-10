import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import { handleStripeWebhook } from '../../../lib/stripe';

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
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      throw new Error('No stripe signature found');
    }

    const result = await handleStripeWebhook(req);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(400).json({
      error: `Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}
