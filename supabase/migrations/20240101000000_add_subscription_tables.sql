-- Create subscription status enum
CREATE TYPE subscription_status AS ENUM ('inactive', 'active', 'past_due', 'cancelled');

-- Add subscription fields to profiles table
ALTER TABLE profiles
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN subscription_status subscription_status DEFAULT 'inactive',
ADD COLUMN subscription_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_period_end TIMESTAMP WITH TIME ZONE;

-- Create subscription history table
CREATE TABLE subscription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    stripe_subscription_id TEXT NOT NULL,
    status subscription_status NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payment history table
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    stripe_payment_intent_id TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for subscription_history
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription history"
    ON subscription_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only system can insert subscription history"
    ON subscription_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for payment_history
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment history"
    ON payment_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only system can insert payment history"
    ON payment_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = user_id
        AND subscription_status = 'active'
        AND subscription_period_end > now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS trigger AS $$
BEGIN
    -- Update profiles table subscription status
    UPDATE profiles
    SET subscription_status = NEW.status,
        subscription_period_start = NEW.period_start,
        subscription_period_end = NEW.period_end,
        updated_at = now()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscription status updates
CREATE TRIGGER on_subscription_update
    AFTER INSERT OR UPDATE ON subscription_history
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_status();

-- Add indexes for better query performance
CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Create function to get subscription details
CREATE OR REPLACE FUNCTION get_subscription_details(user_id UUID)
RETURNS TABLE (
    status subscription_status,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.subscription_status,
        p.subscription_period_start,
        p.subscription_period_end,
        p.subscription_status = 'active' AND p.subscription_period_end > now(),
        CASE 
            WHEN p.subscription_period_end > now() 
            THEN EXTRACT(DAY FROM p.subscription_period_end - now())::INTEGER
            ELSE 0
        END
    FROM profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
