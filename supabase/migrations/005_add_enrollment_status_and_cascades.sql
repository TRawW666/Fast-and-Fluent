-- Migration to add enrollment_status column to students table and configure policies/cascades

-- 1. Add enrollment_status column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS enrollment_status TEXT DEFAULT 'active';

-- 2. Admin UPDATE and DELETE policies on students table if not present
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin can update students' AND tablename = 'students'
  ) THEN
    CREATE POLICY "Admin can update students"
      ON public.students
      FOR UPDATE
      USING ((auth.jwt() ->> 'email') = 'admin@gmail.com');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin can delete students' AND tablename = 'students'
  ) THEN
    CREATE POLICY "Admin can delete students"
      ON public.students
      FOR DELETE
      USING ((auth.jwt() ->> 'email') = 'admin@gmail.com');
  END IF;
END $$;
