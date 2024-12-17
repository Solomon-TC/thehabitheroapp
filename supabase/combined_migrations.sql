-- From 20240101000001_create_habits_and_goals.sql
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    target_days INTEGER NOT NULL,
    streak INTEGER DEFAULT 0,
    last_completed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    unit VARCHAR(50),
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE goal_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL,
    value INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- From 20240101000002_add_character_system.sql
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    strength INTEGER DEFAULT 5,
    agility INTEGER DEFAULT 5,
    intelligence INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

CREATE TABLE character_appearances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    skin_color VARCHAR(7) NOT NULL,
    hair_color VARCHAR(7) NOT NULL,
    eye_color VARCHAR(7) NOT NULL,
    outfit_color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(character_id)
);

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(character_id, title)
);

-- From 20240101000003_link_habits_goals_to_characters.sql
ALTER TABLE habits
ADD CONSTRAINT fk_habits_character
FOREIGN KEY (character_id)
REFERENCES characters(id)
ON DELETE CASCADE;

ALTER TABLE goals
ADD CONSTRAINT fk_goals_character
FOREIGN KEY (character_id)
REFERENCES characters(id)
ON DELETE CASCADE;

ALTER TABLE habit_logs
ADD CONSTRAINT fk_habit_logs_character
FOREIGN KEY (character_id)
REFERENCES characters(id)
ON DELETE CASCADE;

ALTER TABLE goal_progress
ADD CONSTRAINT fk_goal_progress_character
FOREIGN KEY (character_id)
REFERENCES characters(id)
ON DELETE CASCADE;

-- From 20240101000004_add_friends_system.sql
CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(sender_id, receiver_id)
);

CREATE OR REPLACE VIEW friends AS
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
            SELECT 1 FROM friend_requests fr
            WHERE (fr.sender_id = auth.uid() AND fr.receiver_id = receiver_id)
               OR (fr.receiver_id = auth.uid() AND fr.sender_id = sender_id)
        )
    );

CREATE POLICY "Users can update their received friend requests"
    ON friend_requests FOR UPDATE
    USING (auth.uid() = receiver_id AND status = 'pending')
    WITH CHECK (auth.uid() = receiver_id AND status = 'pending');

-- Add notification type for friend requests
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    friend_request_id UUID REFERENCES friend_requests(id),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to notify on friend request
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
DECLARE
    sender_username TEXT;
BEGIN
    SELECT raw_user_meta->>'username' INTO sender_username
    FROM auth.users 
    WHERE id = NEW.sender_id;

    INSERT INTO notifications (user_id, type, title, message, friend_request_id)
    VALUES (
        NEW.receiver_id,
        'friend_request',
        'New Friend Request',
        sender_username || ' sent you a friend request',
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_friend_request_created
    AFTER INSERT ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_friend_request();

-- Add feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
    ON feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
    ON feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);
