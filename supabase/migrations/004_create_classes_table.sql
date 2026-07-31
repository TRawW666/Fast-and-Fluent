-- Migration to create classes table and configure RLS policies

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL,
  class_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  zoom_link TEXT,
  ppt_link TEXT,
  class_date DATE,
  class_time TEXT,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view classes
CREATE POLICY "Anyone can view classes"
  ON public.classes
  FOR SELECT
  USING (true);

-- Allow Admin to insert, update, delete classes
CREATE POLICY "Admin can manage classes"
  ON public.classes
  FOR ALL
  USING ((auth.jwt() ->> 'email') = 'admin@gmail.com');
