-- Add character_id to habits table
ALTER TABLE habits
ADD COLUMN character_id UUID REFERENCES characters(id) ON DELETE CASCADE;

-- Add character_id to habit_logs table
ALTER TABLE habit_logs
ADD COLUMN character_id UUID REFERENCES characters(id) ON DELETE CASCADE;

-- Add character_id to goals table
ALTER TABLE goals
ADD COLUMN character_id UUID REFERENCES characters(id) ON DELETE CASCADE;

-- Add character_id to goal_progress table
ALTER TABLE goal_progress
ADD COLUMN character_id UUID REFERENCES characters(id) ON DELETE CASCADE;

-- Update existing records to link to characters
-- This will be run after initial deployment when users create their characters
CREATE OR REPLACE FUNCTION link_existing_records_to_characters()
RETURNS void AS $$
BEGIN
    -- Link habits to characters
    UPDATE habits h
    SET character_id = (
        SELECT c.id
        FROM characters c
        WHERE c.user_id = h.user_id
        LIMIT 1
    )
    WHERE character_id IS NULL;

    -- Link habit logs to characters
    UPDATE habit_logs hl
    SET character_id = (
        SELECT c.id
        FROM characters c
        WHERE c.user_id = hl.user_id
        LIMIT 1
    )
    WHERE character_id IS NULL;

    -- Link goals to characters
    UPDATE goals g
    SET character_id = (
        SELECT c.id
        FROM characters c
        WHERE c.user_id = g.user_id
        LIMIT 1
    )
    WHERE character_id IS NULL;

    -- Link goal progress to characters
    UPDATE goal_progress gp
    SET character_id = (
        SELECT c.id
        FROM characters c
        WHERE c.user_id = gp.user_id
        LIMIT 1
    )
    WHERE character_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically set character_id on new records
CREATE OR REPLACE FUNCTION set_character_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.character_id := (
        SELECT id
        FROM characters
        WHERE user_id = NEW.user_id
        LIMIT 1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically set character_id
CREATE TRIGGER set_habit_character_id
    BEFORE INSERT ON habits
    FOR EACH ROW
    WHEN (NEW.character_id IS NULL)
    EXECUTE FUNCTION set_character_id();

CREATE TRIGGER set_habit_log_character_id
    BEFORE INSERT ON habit_logs
    FOR EACH ROW
    WHEN (NEW.character_id IS NULL)
    EXECUTE FUNCTION set_character_id();

CREATE TRIGGER set_goal_character_id
    BEFORE INSERT ON goals
    FOR EACH ROW
    WHEN (NEW.character_id IS NULL)
    EXECUTE FUNCTION set_character_id();

CREATE TRIGGER set_goal_progress_character_id
    BEFORE INSERT ON goal_progress
    FOR EACH ROW
    WHEN (NEW.character_id IS NULL)
    EXECUTE FUNCTION set_character_id();

-- Update RLS policies to include character_id checks
ALTER POLICY "Users can view their own habits" ON habits
    USING (auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = habits.character_id
        AND characters.user_id = auth.uid()
    ));

ALTER POLICY "Users can create their own habits" ON habits
    WITH CHECK (auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = habits.character_id
        AND characters.user_id = auth.uid()
    ));

ALTER POLICY "Users can update their own habits" ON habits
    USING (auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = habits.character_id
        AND characters.user_id = auth.uid()
    ));

ALTER POLICY "Users can view their own goals" ON goals
    USING (auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = goals.character_id
        AND characters.user_id = auth.uid()
    ));

ALTER POLICY "Users can create their own goals" ON goals
    WITH CHECK (auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = goals.character_id
        AND characters.user_id = auth.uid()
    ));

ALTER POLICY "Users can update their own goals" ON goals
    USING (auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM characters
        WHERE characters.id = goals.character_id
        AND characters.user_id = auth.uid()
    ));

-- Create indexes for performance
CREATE INDEX idx_habits_character_id ON habits(character_id);
CREATE INDEX idx_habit_logs_character_id ON habit_logs(character_id);
CREATE INDEX idx_goals_character_id ON goals(character_id);
CREATE INDEX idx_goal_progress_character_id ON goal_progress(character_id);
