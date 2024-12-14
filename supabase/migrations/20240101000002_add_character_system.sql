-- Create characters table
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    experience INTEGER NOT NULL DEFAULT 0,
    strength INTEGER NOT NULL DEFAULT 10,
    agility INTEGER NOT NULL DEFAULT 10,
    intelligence INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id) -- One character per user
);

-- Create character_appearances table
CREATE TABLE character_appearances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    hair_style VARCHAR(50) NOT NULL,
    hair_color VARCHAR(7) NOT NULL,
    skin_color VARCHAR(7) NOT NULL,
    eye_color VARCHAR(7) NOT NULL,
    shirt_style VARCHAR(50) NOT NULL,
    shirt_color VARCHAR(7) NOT NULL,
    pants_style VARCHAR(50) NOT NULL,
    pants_color VARCHAR(7) NOT NULL,
    shoes_style VARCHAR(50) NOT NULL,
    shoes_color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(character_id) -- One appearance per character
);

-- Create experience_logs table
CREATE TABLE experience_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason VARCHAR(50) NOT NULL,
    levels_gained INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(character_id, achievement_type) -- Each achievement can only be earned once per character
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_appearances_updated_at
    BEFORE UPDATE ON character_appearances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Characters policies
CREATE POLICY "Users can view their own character"
    ON characters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own character"
    ON characters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own character"
    ON characters FOR UPDATE
    USING (auth.uid() = user_id);

-- Character appearances policies
CREATE POLICY "Users can view their character's appearance"
    ON character_appearances FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = character_appearances.character_id
        AND characters.user_id = auth.uid()
    ));

CREATE POLICY "Users can create their character's appearance"
    ON character_appearances FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = character_appearances.character_id
        AND characters.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their character's appearance"
    ON character_appearances FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = character_appearances.character_id
        AND characters.user_id = auth.uid()
    ));

-- Experience logs policies
CREATE POLICY "Users can view their character's experience logs"
    ON experience_logs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = experience_logs.character_id
        AND characters.user_id = auth.uid()
    ));

CREATE POLICY "Users can create experience logs for their character"
    ON experience_logs FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = experience_logs.character_id
        AND characters.user_id = auth.uid()
    ));

-- Achievements policies
CREATE POLICY "Users can view their character's achievements"
    ON achievements FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = achievements.character_id
        AND characters.user_id = auth.uid()
    ));

CREATE POLICY "Users can create achievements for their character"
    ON achievements FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = achievements.character_id
        AND characters.user_id = auth.uid()
    ));
