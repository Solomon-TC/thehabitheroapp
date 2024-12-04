-- Previous schema content remains the same

-- Create feedback table
create type feedback_status as enum ('new', 'in_progress', 'resolved');
create type feedback_category as enum ('bug', 'feature', 'improvement', 'general');

create table if not exists feedback (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    category feedback_category not null,
    message text not null,
    status feedback_status not null default 'new',
    response text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    resolved_at timestamp with time zone,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add trigger for updating timestamps
create trigger update_feedback_updated_at
    before update on feedback
    for each row
    execute function update_updated_at_column();

-- Add RLS policies for feedback
alter table feedback enable row level security;

-- Users can view their own feedback
create policy "Users can view their own feedback"
    on feedback for select
    using (auth.uid() = user_id);

-- Users can create feedback
create policy "Users can create feedback"
    on feedback for insert
    with check (auth.uid() = user_id);

-- Admins can view all feedback
create policy "Admins can view all feedback"
    on feedback for select
    using (is_admin(auth.uid()));

-- Admins can update feedback
create policy "Admins can update feedback"
    on feedback for update
    using (is_admin(auth.uid()));

-- Function to get unread feedback count for admins
create or replace function get_unread_feedback_count()
returns bigint as $$
begin
    return (
        select count(*)
        from feedback
        where status = 'new'
    );
end;
$$ language plpgsql security definer;

-- Function to get feedback summary
create or replace function get_feedback_summary()
returns table (
    total_feedback bigint,
    new_feedback bigint,
    in_progress_feedback bigint,
    resolved_feedback bigint,
    avg_resolution_time interval
) as $$
begin
    return query
    select
        count(*) as total_feedback,
        count(*) filter (where status = 'new') as new_feedback,
        count(*) filter (where status = 'in_progress') as in_progress_feedback,
        count(*) filter (where status = 'resolved') as resolved_feedback,
        avg(resolved_at - created_at) filter (where status = 'resolved') as avg_resolution_time
    from feedback;
end;
$$ language plpgsql security definer;

-- Function to notify admins of new feedback
create or replace function notify_admins_of_feedback()
returns trigger as $$
begin
    insert into admin_logs (admin_id, action, details)
    select
        ur.user_id,
        'new_feedback',
        jsonb_build_object(
            'feedback_id', NEW.id,
            'category', NEW.category,
            'created_at', NEW.created_at
        )
    from user_roles ur
    where ur.role = 'admin';
    
    return NEW;
end;
$$ language plpgsql security definer;

-- Add trigger for admin notification
create trigger notify_admins_new_feedback
    after insert on feedback
    for each row
    execute function notify_admins_of_feedback();

-- Add feedback-related columns to admin_settings
insert into admin_settings (key, value, updated_by)
select 
    'feedback_notifications',
    '{"email": true, "dashboard": true}'::jsonb,
    (select user_id from user_roles where role = 'admin' limit 1)
where not exists (
    select 1 from admin_settings where key = 'feedback_notifications'
);
