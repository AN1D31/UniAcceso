-- The v2 migration only created a public SELECT policy on `programs`, so every INSERT,
-- UPDATE and DELETE from the app is rejected by Row Level Security.
-- Allow admins (profiles.role = 'admin', checked through public.is_admin()) to manage programs.
-- Requires public.is_admin() from 20261004130000_scholarships_optional_university_and_insert_policy.sql.

DROP POLICY IF EXISTS "Admins can insert programs" ON programs;
DROP POLICY IF EXISTS "Admins can update programs" ON programs;
DROP POLICY IF EXISTS "Admins can delete programs" ON programs;

CREATE POLICY "Admins can insert programs" ON programs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update programs" ON programs
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete programs" ON programs
  FOR DELETE TO authenticated
  USING (public.is_admin());
