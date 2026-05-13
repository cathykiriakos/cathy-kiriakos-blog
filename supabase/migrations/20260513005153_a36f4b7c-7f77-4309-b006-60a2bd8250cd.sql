
DROP POLICY IF EXISTS "Authenticated users can manage home sections" ON public.home_sections;

CREATE POLICY "Owner can manage home sections"
  ON public.home_sections
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'cathy.a.kiriakos@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'cathy.a.kiriakos@gmail.com');
