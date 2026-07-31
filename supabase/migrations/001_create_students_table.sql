-- Migration to create students table and configure RLS policies

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert their own student record
CREATE POLICY "Students can insert their own record"
  ON public.students
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Allow users to select their own student record
CREATE POLICY "Students can view their own record"
  ON public.students
  FOR SELECT
  USING (auth.uid() = id);
