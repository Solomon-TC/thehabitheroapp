-- Create characters table
CREATE TABLE characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    strength INTEGER DEFAULT 1,
    agility INTEGER DEFAULT 1,
    intelligence INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create character_appearance table
CREATE TABLE character_appearance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE UNIQUE,
    hair_style TEXT NOT NULL,
    hair_color TEXT NOT NULL,
    skin_color TEXT NOT NULL,
    eye_color TEXT NOT NULL,
    outfit TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create achievements table
CREATE TABLE achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    experience_reward INTEGER NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_achievements table for tracking earned achievements
CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, achievement_id)
);

-- Create experience_logs table for tracking XP gains
CREATE TABLE experience_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source_type TEXT NOT NULL, -- 'habit', 'goal', 'achievement'
    source_id UUID NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX character_user_id_idx ON characters(user_id);
CREATE INDEX character_appearance_character_id_idx ON character_appearance(character_id);
CREATE INDEX user_achievements_user_id_idx ON user_achievements(user_id);
CREATE INDEX user_achievements_achievement_id_idx ON user_achievements(achievement_id);
CREATE INDEX experience_logs_user_id_idx ON experience_logs(user_id);

-- Enable Row Level Security
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_appearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for characters
CREATE POLICY "Users can view their own character"
    ON characters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own character"
    ON characters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own character"
    ON characters FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policies for character_appearance
CREATE POLICY "Users can view their character's appearance"
    ON character_appearance FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = character_appearance.character_id
        AND characters.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their character's appearance"
    ON character_appearance FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = character_appearance.character_id
        AND characters.user_id = auth.uid()
    ));

CREATE POLICY "Users can create their character's appearance"
    ON character_appearance FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = character_appearance.character_id
        AND characters.user_id = auth.uid()
    ));

-- Create policies for achievements
CREATE POLICY "Anyone can view achievements"
    ON achievements FOR SELECT
    USING (true);

-- Create policies for user_achievements
CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policies for experience_logs
CREATE POLICY "Users can view their own experience logs"
    ON experience_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create experience logs"
    ON experience_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_character_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_character_updated_at();

CREATE TRIGGER update_character_appearance_updated_at
    BEFORE UPDATE ON character_appearance
    FOR EACH ROW
    EXECUTE FUNCTION update_character_updated_at();

-- Insert some default achievements
INSERT INTO achievements (name, description, experience_reward, icon) VALUES
    ('First Steps', 'Complete your first habit', 100, '🌟'),
    ('Goal Setter', 'Create your first goal', 100, '🎯'),
    ('Habit Master', 'Complete a habit 7 days in a row', 500, '⭐'),
    ('Goal Achiever', 'Complete your first goal', 500, '🏆'),
    ('Level 10', 'Reach level 10', 1000, '🔥'),
    ('Perfect Week', 'Complete all habits for a week', 1000, '📅'),
    ('Milestone Master', 'Complete 5 goals', 2000, '🎊'),
    ('Dedicated', 'Log in 30 days in a row', 3000, '💫');
