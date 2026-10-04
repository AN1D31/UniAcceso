-- 1) university_id opcional (DROP NOT NULL es idempotente).
ALTER TABLE scholarships ALTER COLUMN university_id DROP NOT NULL;

-- 2) El CHECK at_least_one_sponsor sigue validando filas NUEVAS aunque sea NOT VALID:
--    sin quitarlo, un INSERT con university_id y sponsor_id NULL falla.
ALTER TABLE scholarships DROP CONSTRAINT IF EXISTS at_least_one_sponsor;

-- 3) is_admin(): el rol vive en profiles.role (no en el JWT). SECURITY DEFINER
--    hace que la consulta a profiles se ejecute con los permisos del dueño de la
--    función y se salte el RLS de profiles: no depende de sus políticas SELECT
--    ni puede caer en recursión si algún día profiles referencia a is_admin().
--    search_path fijo para evitar secuestro de funciones/tablas.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 4) Políticas de admins sobre scholarships. Se recrean (DROP + CREATE) porque la
--    migración anterior solo las creaba si no existían, y una política previa con
--    el mismo nombre pero otra definición habría quedado intacta.
DROP POLICY IF EXISTS "Authenticated users can insert scholarships" ON scholarships;
DROP POLICY IF EXISTS "Admins can insert scholarships" ON scholarships;
DROP POLICY IF EXISTS "Admins can update scholarships" ON scholarships;
DROP POLICY IF EXISTS "Admins can delete scholarships" ON scholarships;

CREATE POLICY "Admins can insert scholarships" ON scholarships
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update scholarships" ON scholarships
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete scholarships" ON scholarships
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 5) Evitar escalada de privilegios: "Users can update own profile" permite a
--    cualquiera hacer UPDATE de su fila, incluido role = 'admin'. Como is_admin()
--    confía en profiles.role, solo un admin (o service_role / SQL Editor, donde
--    auth.uid() es NULL) puede cambiar el rol.
CREATE OR REPLACE FUNCTION public.prevent_role_self_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND (SELECT auth.uid()) IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'No tienes permiso para cambiar el rol';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_role_self_change ON profiles;
CREATE TRIGGER trigger_prevent_role_self_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_change();
