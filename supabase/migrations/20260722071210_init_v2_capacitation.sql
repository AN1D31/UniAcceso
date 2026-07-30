-- ======================================================
-- SCRIPT DE MIGRACIÓN UNIACCESO v2.0
-- Zero Data Loss | Producción Segura
-- Fecha: 22 de Julio 2026
-- ======================================================

-- ============================================
-- 1. EXTENSIONES (Seguro)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. TABLAS NUEVAS (No existen)
-- ============================================

-- 2.1 Países
CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  iso_code CHAR(2) NOT NULL UNIQUE,
  region VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Ciudades
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, country_id)
);

-- 2.3 Categorías (Jerárquicas)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Tipos de Fuente
CREATE TABLE IF NOT EXISTS source_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Patrocinadores
CREATE TABLE IF NOT EXISTS sponsors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'embajada',
    'gobierno',
    'fundacion',
    'empresa',
    'ong',
    'organismo_internacional',
    'otro'
  )),
  country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
  website_url TEXT,
  logo_url TEXT,
  description TEXT,
  source_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Tablas Puente (Nuevas)
CREATE TABLE IF NOT EXISTS university_careers (
  university_id BIGINT NOT NULL,
  career VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (university_id, career)
);

CREATE TABLE IF NOT EXISTS program_categories (
  program_id BIGINT NOT NULL,
  category_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (program_id, category_id)
);

CREATE TABLE IF NOT EXISTS event_tags (
  event_id UUID NOT NULL,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, tag)
);

-- ============================================
-- 3. ALTER TABLE - TABLAS EXISTENTES
-- ============================================

-- 3.1 universities (Agregar campos nuevos)
ALTER TABLE universities
  ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id),
  ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES cities(id),
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS ranking INTEGER CHECK (ranking IS NULL OR ranking BETWEEN 1 AND 1000),
  ADD COLUMN IF NOT EXISTS source_type_id INTEGER REFERENCES source_types(id),
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS source_metadata JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ranking ya existe como TEXT en producción (100% NULL); se convierte a INTEGER
-- para que el CHECK de la sección 4.3 (ranking > 0) sea válido.
ALTER TABLE universities ALTER COLUMN ranking TYPE INTEGER USING NULLIF(ranking, '')::INTEGER;

-- Nota: department se mantiene, careers se migrará a university_careers

-- 3.2 programs (Agregar campos nuevos)
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS modality VARCHAR(50) CHECK (modality IN ('presencial', 'virtual', 'hibrido')),
  ADD COLUMN IF NOT EXISTS credits INTEGER CHECK (credits > 0),
  ADD COLUMN IF NOT EXISTS duration_months INTEGER CHECK (duration_months > 0),
  ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Nota: knowledge_area se mantiene, se migrará a categories

-- 3.3 scholarships (Agregar campos nuevos)
ALTER TABLE scholarships
  ADD COLUMN IF NOT EXISTS university_id BIGINT REFERENCES universities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS program_id BIGINT REFERENCES programs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id),
  ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES cities(id),
  ADD COLUMN IF NOT EXISTS sponsor_id INTEGER REFERENCES sponsors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id),
  ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2) CHECK (amount >= 0),
  ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS coverage VARCHAR(50) CHECK (coverage IN ('parcial', 'total', 'manutencion', 'matricula')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS source_type_id INTEGER REFERENCES source_types(id),
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS source_metadata JSONB,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3.4 profiles (Agregar campos nuevos)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id),
  ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES cities(id);

-- 3.5 events → trainings (RENAME y AGREGAR campos)
ALTER TABLE IF EXISTS events RENAME TO trainings;

ALTER TABLE trainings
  ADD COLUMN IF NOT EXISTS type VARCHAR(50) CHECK (type IN (
    'evento_sincronico',
    'curso_asincronico',
    'taller_practico'
  )),
  ADD COLUMN IF NOT EXISTS modality VARCHAR(50) CHECK (modality IN ('virtual', 'presencial', 'hibrido')),
  ADD COLUMN IF NOT EXISTS certification_type VARCHAR(50) CHECK (certification_type IN (
    'merito',
    'asistencia',
    'oficial',
    'ninguno'
  )),
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sponsor_id INTEGER REFERENCES sponsors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id),
  ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES cities(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 4. CONSTRAINTS (Agregar restricciones)
-- ============================================

-- 4.1 scholarships: Al menos un patrocinador
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'at_least_one_sponsor'
  ) THEN
    -- NOT VALID: hay 24 becas existentes sin university_id/sponsor_id (columnas nuevas);
    -- se aplica solo a filas nuevas/editadas para no romper la migración ni tocar datos existentes.
    ALTER TABLE scholarships
      ADD CONSTRAINT at_least_one_sponsor
      CHECK (university_id IS NOT NULL OR sponsor_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

-- 4.2 scholarships: Fechas válidas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'scholarships_valid_dates_check'
  ) THEN
    ALTER TABLE scholarships
      ADD CONSTRAINT scholarships_valid_dates_check
      CHECK (start_date <= finish_date);
  END IF;
END $$;

-- 4.3 universities: Ranking válido
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'universities_ranking_check'
  ) THEN
    ALTER TABLE universities
      ADD CONSTRAINT universities_ranking_check
      CHECK (ranking IS NULL OR ranking > 0);
  END IF;
END $$;

-- ============================================
-- 5. ÍNDICES (Optimización)
-- ============================================

-- 5.1 Scholarships
CREATE INDEX IF NOT EXISTS idx_scholarships_university ON scholarships(university_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_program ON scholarships(program_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_country ON scholarships(country_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_city ON scholarships(city_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_sponsor ON scholarships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_category ON scholarships(category_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_dates ON scholarships(start_date, finish_date);
CREATE INDEX IF NOT EXISTS idx_scholarships_active ON scholarships(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarships_url ON scholarships(url) WHERE url IS NOT NULL;

-- 5.2 Universities
CREATE INDEX IF NOT EXISTS idx_universities_country ON universities(country_id);
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city_id);
CREATE INDEX IF NOT EXISTS idx_universities_ranking ON universities(ranking);
CREATE INDEX IF NOT EXISTS idx_universities_top ON universities(is_top);

-- 5.3 Programs
CREATE INDEX IF NOT EXISTS idx_programs_university ON programs(university_id);
CREATE INDEX IF NOT EXISTS idx_programs_level ON programs(level);
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category_id);

-- 5.4 Sponsors
CREATE INDEX IF NOT EXISTS idx_sponsors_type ON sponsors(type);
CREATE INDEX IF NOT EXISTS idx_sponsors_country ON sponsors(country_id);

-- 5.5 Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country_id);

-- 5.6 Trainings (ex-events)
CREATE INDEX IF NOT EXISTS idx_trainings_country ON trainings(country_id);
CREATE INDEX IF NOT EXISTS idx_trainings_city ON trainings(city_id);
CREATE INDEX IF NOT EXISTS idx_trainings_sponsor ON trainings(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_trainings_type ON trainings(type);
CREATE INDEX IF NOT EXISTS idx_trainings_date ON trainings(iso_date);

-- 5.7 Tablas Puente
CREATE INDEX IF NOT EXISTS idx_university_careers_university ON university_careers(university_id);
CREATE INDEX IF NOT EXISTS idx_program_categories_program ON program_categories(program_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_event ON event_tags(event_id);

-- ============================================
-- 6. FUNCIONES Y TRIGGERS
-- ============================================

-- 6.1 Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6.2 Triggers para tablas con updated_at (Solo si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_universities_updated_at') THEN
    CREATE TRIGGER trigger_universities_updated_at
      BEFORE UPDATE ON universities FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_programs_updated_at') THEN
    CREATE TRIGGER trigger_programs_updated_at
      BEFORE UPDATE ON programs FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_scholarships_updated_at') THEN
    CREATE TRIGGER trigger_scholarships_updated_at
      BEFORE UPDATE ON scholarships FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_sponsors_updated_at') THEN
    CREATE TRIGGER trigger_sponsors_updated_at
      BEFORE UPDATE ON sponsors FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_trainings_updated_at') THEN
    CREATE TRIGGER trigger_trainings_updated_at
      BEFORE UPDATE ON trainings FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_countries_updated_at') THEN
    CREATE TRIGGER trigger_countries_updated_at
      BEFORE UPDATE ON countries FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_cities_updated_at') THEN
    CREATE TRIGGER trigger_cities_updated_at
      BEFORE UPDATE ON cities FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_categories_updated_at') THEN
    CREATE TRIGGER trigger_categories_updated_at
      BEFORE UPDATE ON categories FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- 6.3 Función para refrescar vistas materializadas automáticamente
-- Nota: no se usa CONCURRENTLY porque un trigger corre dentro de la misma
-- transacción de la sentencia que lo dispara, y REFRESH ... CONCURRENTLY
-- no puede ejecutarse dentro de un bloque de transacción.
CREATE OR REPLACE FUNCTION refresh_mv_scholarship_full()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_scholarship_full;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6.4 Trigger para refrescar vista (Solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_refresh_mv_scholarship') THEN
    CREATE TRIGGER trigger_refresh_mv_scholarship
      AFTER INSERT OR UPDATE OR DELETE ON scholarships
      FOR EACH STATEMENT
      EXECUTE FUNCTION refresh_mv_scholarship_full();
  END IF;
END $$;

-- ============================================
-- 7. VISTAS MATERIALIZADAS
-- ============================================

-- 7.1 Eliminar vistas existentes si es necesario
DROP MATERIALIZED VIEW IF EXISTS mv_scholarship_full CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_university_full CASCADE;

-- 7.2 Vista para Scholarships (con sponsors)
CREATE MATERIALIZED VIEW mv_scholarship_full AS
SELECT
  s.id,
  s.name,
  s.description,
  s.requirements,
  s.start_date,
  s.finish_date,
  s.amount,
  s.currency,
  s.coverage,
  s.url,
  -- Datos geográficos
  c.name AS country,
  ci.name AS city,
  -- Universidad
  u.name AS university,
  u.id AS university_id,
  -- Programa
  p.name AS program,
  p.level AS program_level,
  -- Sponsor
  sp.name AS sponsor_name,
  sp.type AS sponsor_type,
  sp.website_url AS sponsor_website,
  spc.name AS sponsor_country,
  -- Categoría
  cat.name AS category,
  -- Fuente
  st.name AS source_type,
  s.source_url,
  s.source_metadata,
  s.created_at,
  s.updated_at
FROM scholarships s
LEFT JOIN countries c ON s.country_id = c.id
LEFT JOIN cities ci ON s.city_id = ci.id
LEFT JOIN universities u ON s.university_id = u.id
LEFT JOIN programs p ON s.program_id = p.id
LEFT JOIN sponsors sp ON s.sponsor_id = sp.id
LEFT JOIN countries spc ON sp.country_id = spc.id
LEFT JOIN categories cat ON s.category_id = cat.id
LEFT JOIN source_types st ON s.source_type_id = st.id
WHERE s.is_active = TRUE;

-- 7.3 Vista para Universidades (con programas y carreras)
CREATE MATERIALIZED VIEW mv_university_full AS
SELECT
  u.id,
  u.name,
  u.description,
  c.name AS country,
  ci.name AS city,
  u.website_url,
  u.image_url,
  u.ranking,
  u.is_top,
  COALESCE(
    json_agg(DISTINCT uc.career) FILTER (WHERE uc.career IS NOT NULL),
    '[]'::json
  ) AS careers,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'level', p.level,
        'modality', p.modality
      )
    ) FILTER (WHERE p.id IS NOT NULL),
    '[]'::json
  ) AS programs
FROM universities u
LEFT JOIN countries c ON u.country_id = c.id
LEFT JOIN cities ci ON u.city_id = ci.id
LEFT JOIN university_careers uc ON u.id = uc.university_id
LEFT JOIN programs p ON u.id = p.university_id
GROUP BY u.id, c.name, ci.name;

-- 7.4 Índices en Vistas Materializadas
CREATE INDEX IF NOT EXISTS idx_mv_scholarship_country ON mv_scholarship_full(country);
CREATE INDEX IF NOT EXISTS idx_mv_scholarship_category ON mv_scholarship_full(category);
CREATE INDEX IF NOT EXISTS idx_mv_scholarship_sponsor ON mv_scholarship_full(sponsor_name);
CREATE INDEX IF NOT EXISTS idx_mv_scholarship_university ON mv_scholarship_full(university);

-- ============================================
-- 8. MIGRACIÓN DE DATOS (Zero Data Loss)
-- ============================================

-- 8.1 universities.careers es un conteo (texto numérico: "273", "124", ...), no una lista
-- de nombres de carreras: se renombra a career_count y se convierte a INTEGER. No hay
-- nombres de carrera que migrar; university_careers queda creada pero vacía.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'universities' AND column_name = 'careers'
  ) THEN
    ALTER TABLE universities RENAME COLUMN careers TO career_count;
    ALTER TABLE universities ALTER COLUMN career_count TYPE INTEGER USING NULLIF(career_count, '')::INTEGER;
  END IF;
END $$;

-- 8.2 Migrar department de universities a country_id (solo si existe)
DO $$
BEGIN
  -- Este es un mapeo manual, ajustar según datos reales
  -- Ejemplo básico: si department contiene 'Colombia' o 'Bogotá'
  UPDATE universities u
  SET country_id = c.id
  FROM countries c
  WHERE u.department LIKE '%' || c.name || '%'
    AND u.country_id IS NULL;
END $$;

-- 8.3 Migrar location de scholarships a country_id (solo si existe)
DO $$
BEGIN
  UPDATE scholarships s
  SET country_id = c.id
  FROM countries c
  WHERE s.location LIKE '%' || c.name || '%'
    AND s.country_id IS NULL;
END $$;

-- 8.4 Migrar knowledge_area de programs a categories (solo si existe)
DO $$
DECLARE
  prog_record RECORD;
  cat_id INTEGER;
BEGIN
  FOR prog_record IN
    SELECT id, knowledge_area FROM programs
    WHERE knowledge_area IS NOT NULL AND knowledge_area <> ''
  LOOP
    -- Intentar encontrar categoría exacta
    SELECT id INTO cat_id FROM categories
    WHERE name ILIKE '%' || prog_record.knowledge_area || '%'
    LIMIT 1;

    IF cat_id IS NOT NULL THEN
      UPDATE programs SET category_id = cat_id WHERE id = prog_record.id;
    END IF;
  END LOOP;
END $$;

-- 8.5 Migrar tags de events a event_tags (ahora trainings)
DO $$
DECLARE
  event_record RECORD;
  tag_item TEXT;
BEGIN
  FOR event_record IN
    SELECT id, tags FROM trainings
    WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  LOOP
    FOREACH tag_item IN ARRAY event_record.tags
    LOOP
      INSERT INTO event_tags (event_id, tag)
      VALUES (event_record.id, tag_item)
      ON CONFLICT (event_id, tag) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 8.6 Insertar source_types por defecto
INSERT INTO source_types (name, description) VALUES
  ('web_oficial', 'Fuente oficial de la institución'),
  ('influencer', 'Recomendado por influencer educativo'),
  ('pdf', 'Documento PDF escaneado'),
  ('video_tiktok', 'Video de TikTok'),
  ('video_youtube', 'Video de YouTube'),
  ('reel_instagram', 'Reel de Instagram'),
  ('scraping_manual', 'Extracción manual de datos')
ON CONFLICT (name) DO NOTHING;

-- 8.7 Insertar categorías base
INSERT INTO categories (name, description) VALUES
  ('Ciencias Básicas', 'Matemáticas, Física, Química, Biología'),
  ('Ingeniería', 'Ingeniería Civil, Sistemas, Mecánica, Eléctrica'),
  ('Ciencias Sociales', 'Sociología, Psicología, Antropología, Economía'),
  ('Humanidades', 'Filosofía, Historia, Literatura, Arte'),
  ('Ciencias de la Salud', 'Medicina, Enfermería, Odontología, Nutrición'),
  ('Educación', 'Pedagogía, Didáctica, Administración Educativa'),
  ('Derecho', 'Derecho Público, Privado, Internacional'),
  ('Negocios', 'Administración, Contabilidad, Finanzas, Marketing'),
  ('Arquitectura', 'Diseño Urbano, Construcción, Paisajismo'),
  ('Comunicación', 'Periodismo, Publicidad, Multimedia')
ON CONFLICT (name) DO NOTHING;

-- 8.8 Insertar países LATAM
INSERT INTO countries (name, iso_code, region) VALUES
  ('Argentina', 'AR', 'Sudamérica'),
  ('Bolivia', 'BO', 'Sudamérica'),
  ('Brasil', 'BR', 'Sudamérica'),
  ('Chile', 'CL', 'Sudamérica'),
  ('Colombia', 'CO', 'Sudamérica'),
  ('Costa Rica', 'CR', 'Centroamérica'),
  ('Cuba', 'CU', 'Caribe'),
  ('Ecuador', 'EC', 'Sudamérica'),
  ('El Salvador', 'SV', 'Centroamérica'),
  ('Guatemala', 'GT', 'Centroamérica'),
  ('Honduras', 'HN', 'Centroamérica'),
  ('México', 'MX', 'Norteamérica'),
  ('Nicaragua', 'NI', 'Centroamérica'),
  ('Panamá', 'PA', 'Centroamérica'),
  ('Paraguay', 'PY', 'Sudamérica'),
  ('Perú', 'PE', 'Sudamérica'),
  ('República Dominicana', 'DO', 'Caribe'),
  ('Uruguay', 'UY', 'Sudamérica'),
  ('Venezuela', 'VE', 'Sudamérica')
ON CONFLICT (name) DO NOTHING;

-- 8.9 Insertar ciudades principales (Ejemplo)
INSERT INTO cities (name, country_id) VALUES
  ('Buenos Aires', (SELECT id FROM countries WHERE iso_code = 'AR')),
  ('Bogotá', (SELECT id FROM countries WHERE iso_code = 'CO')),
  ('Ciudad de México', (SELECT id FROM countries WHERE iso_code = 'MX')),
  ('Santiago', (SELECT id FROM countries WHERE iso_code = 'CL')),
  ('Lima', (SELECT id FROM countries WHERE iso_code = 'PE')),
  ('São Paulo', (SELECT id FROM countries WHERE iso_code = 'BR')),
  ('Montevideo', (SELECT id FROM countries WHERE iso_code = 'UY')),
  ('Quito', (SELECT id FROM countries WHERE iso_code = 'EC')),
  ('San José', (SELECT id FROM countries WHERE iso_code = 'CR'))
ON CONFLICT (name, country_id) DO NOTHING;

-- ============================================
-- 9. VERIFICACIÓN POST-MIGRACIÓN
-- ============================================

-- 9.1 Verificar que no hay becas sin patrocinador
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM scholarships
  WHERE university_id IS NULL AND sponsor_id IS NULL;

  IF orphan_count > 0 THEN
    RAISE NOTICE '⚠️ ADVERTENCIA: % becas sin patrocinador (university_id y sponsor_id NULL)', orphan_count;
    RAISE NOTICE 'Se recomienda asignar un sponsor por defecto manualmente.';
  ELSE
    RAISE NOTICE '✅ Todas las becas tienen patrocinador.';
  END IF;
END $$;

-- 9.2 Verificar que todas las universidades tienen country_id
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM universities
  WHERE country_id IS NULL;

  IF missing_count > 0 THEN
    RAISE NOTICE '⚠️ ADVERTENCIA: % universidades sin país asignado.', missing_count;
  ELSE
    RAISE NOTICE '✅ Todas las universidades tienen país.';
  END IF;
END $$;

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS) - Supabase
-- ============================================

-- Activar RLS en todas las tablas
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (Solo si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access' AND tablename = 'scholarships') THEN
    CREATE POLICY "Public read access" ON scholarships FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON universities FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON programs FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON sponsors FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON trainings FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON countries FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON cities FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
  END IF;
END $$;

-- Políticas de perfiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Políticas de chat history
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own chat history' AND tablename = 'chat_history') THEN
    CREATE POLICY "Users can view own chat history" ON chat_history FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own chat history" ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas de contacto y waitlist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert contact messages' AND tablename = 'contact_messages') THEN
    CREATE POLICY "Anyone can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anyone can join waitlist" ON waitlist FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- 11. REPORTE FINAL (CORREGIDO)
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ MIGRACIÓN UNIACCESO v2.0 COMPLETADA';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tablas creadas: countries, cities, categories,';
  RAISE NOTICE '              source_types, sponsors,';
  RAISE NOTICE '              university_careers, program_categories,';
  RAISE NOTICE '              event_tags';
  RAISE NOTICE 'Tablas modificadas: universities, programs,';
  RAISE NOTICE '              scholarships, profiles';
  RAISE NOTICE 'Tabla renombrada: events → trainings';
  RAISE NOTICE 'Vistas creadas: mv_scholarship_full,';
  RAISE NOTICE '              mv_university_full';
  RAISE NOTICE '============================================';
  RAISE NOTICE '⚠️ REVISAR ADVERTENCIAS EN LOGS';
  RAISE NOTICE '============================================';
END $$;
