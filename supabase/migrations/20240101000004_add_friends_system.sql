-- Create friend requests table
CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(sender_id, receiver_id)
);

-- Create friends view for easier querying
CREATE VIEW friends AS
SELECT 
    CASE 
        WHEN fr.sender_id = auth.uid() THEN fr.receiver_id
        ELSE fr.sender_id
    END as friend_id,
    fr.created_at as friends_since
FROM friend_requests fr
WHERE 
    fr.status = 'accepted' 
    AND (fr.sender_id = auth.uid() OR fr.receiver_id = auth.uid());

-- Create function to handle friend request responses
CREATE OR REPLACE FUNCTION handle_friend_request(request_id UUID, new_status VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE friend_requests
    SET 
        status = new_status,
        updated_at = timezone('utc'::text, now())
    WHERE 
        id = request_id 
        AND receiver_id = auth.uid()
        AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend requests"
    ON friend_requests FOR SELECT
    USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send friend requests"
    ON friend_requests FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id 
        AND sender_id != receiver_id
        AND NOT EXISTS (
            SELECT 1 FROM friend_requests
            WHERE (sender_id = auth.uid() AND receiver_id = NEW.receiver_id)
               OR (receiver_id = auth.uid() AND sender_id = NEW.receiver_id)
        )
    );

CREATE POLICY "Users can update their received friend requests"
    ON friend_requests FOR UPDATE
    USING (auth.uid() = receiver_id AND status = 'pending')
    WITH CHECK (auth.uid() = receiver_id AND status = 'pending');

-- Add notification type for friend requests
ALTER TABLE notifications ADD COLUMN friend_request_id UUID REFERENCES friend_requests(id);

-- Create function to notify on friend request
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, friend_request_id)
    VALUES (
        NEW.receiver_id,
        'friend_request',
        'New Friend Request',
        (SELECT username FROM auth.users WHERE id = NEW.sender_id) || ' sent you a friend request',
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_friend_request_created
    AFTER INSERT ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_friend_request();
