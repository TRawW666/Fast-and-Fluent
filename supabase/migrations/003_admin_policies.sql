-- Migration to grant SELECT access on students and bookings tables to ADMIN_EMAIL

-- Admin SELECT policy on students table
CREATE POLICY "Admin can view all students"
  ON public.students
  FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'admin@gmail.com');

-- Admin SELECT policy on bookings table
CREATE POLICY "Admin can view all bookings"
  ON public.bookings
  FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'admin@gmail.com');
