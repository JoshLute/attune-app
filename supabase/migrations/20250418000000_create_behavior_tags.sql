
-- Create behavior_tags table
CREATE TABLE public.behavior_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  tag TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Set up RLS (Row Level Security)
ALTER TABLE public.behavior_tags ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert behavior tags"
  ON public.behavior_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow users to view their own inserts
CREATE POLICY "Allow users to view inserted behavior tags"
  ON public.behavior_tags
  FOR SELECT
  TO authenticated
  USING (true);

-- Add an index on session_id for faster querying
CREATE INDEX idx_behavior_tags_session_id ON public.behavior_tags (session_id);
