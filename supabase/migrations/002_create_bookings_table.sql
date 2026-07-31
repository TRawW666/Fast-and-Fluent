-- Migration to create bookings table and configure RLS policies

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Demo Booked',
  preferred_date DATE,
  preferred_time TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert their own bookings
CREATE POLICY "Students can insert their own bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Policy: Allow users to select their own bookings
CREATE POLICY "Students can view their own bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = student_id);
