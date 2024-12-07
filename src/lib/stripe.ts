import Stripe from 'stripe';
import { supabase } from './supabase';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
  typescript: true,
});

export const getStripeCustomer = async (userId: string) => {
  try {
    // Check if user already has a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    if (profile?.stripe_customer_id) {
      return profile.stripe_customer_id;
    }

    // Get user email
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    if (!user?.email) {
      throw new Error('User email not found');
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId,
      },
    });

    // Save Stripe customer ID to profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    if (updateError) throw updateError;

    return customer.id;
  } catch (error) {
    console.error('Error in getStripeCustomer:', error);
    throw error;
  }
};

export const createCheckoutSession = async (userId: string) => {
  try {
    const customerId = await getStripeCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Your subscription price ID
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancelled`,
      metadata: {
        userId,
      },
    });

    return session;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    throw error;
  }
};

export const createPortalSession = async (userId: string) => {
  try {
    const customerId = await getStripeCustomer(userId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
    });

    return session;
  } catch (error) {
    console.error('Error in createPortalSession:', error);
    throw error;
  }
};

export const getSubscriptionStatus = async (userId: string): Promise<'active' | 'inactive'> => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    if (!profile?.stripe_customer_id) {
      return 'inactive';
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    const isActive = subscriptions.data.length > 0;
    const status = isActive ? 'active' : 'inactive';

    // Update subscription status if it has changed
    if (status !== profile.subscription_status) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_status: status })
        .eq('id', userId);

      if (updateError) throw updateError;
    }

    return status;
  } catch (error) {
    console.error('Error in getSubscriptionStatus:', error);
    throw error;
  }
};

export const handleStripeWebhook = async (
  signature: string,
  rawBody: Buffer
) => {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user ID from customer metadata
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata?.userId;

        if (!userId) {
          throw new Error('No userId found in customer metadata');
        }

        // Update subscription status
        const status = subscription.status === 'active' ? 'active' : 'inactive';
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ subscription_status: status })
          .eq('id', userId);

        if (updateError) throw updateError;
        break;
      }
    }

    return { received: true };
  } catch (error) {
    console.error('Error in handleStripeWebhook:', error);
    throw error;
  }
};
