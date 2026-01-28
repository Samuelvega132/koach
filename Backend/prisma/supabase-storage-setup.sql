-- ============================================
-- KOACH - Supabase Storage Configuration (CORREGIDO)
-- ============================================
-- Este script configura el bucket de Storage y las políticas RLS

-- 1. CREAR BUCKET PÚBLICO (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('songs', 'songs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. CONFIGURAR RLS POLICY - LECTURA PÚBLICA
-- Primero borramos la política si existe para evitar errores
DROP POLICY IF EXISTS "Public Access - Read" ON storage.objects;

-- Creamos la política de nuevo
CREATE POLICY "Public Access - Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'songs' );

-- 3. CONFIGURAR RLS POLICY - ESCRITURA (Opcional)
-- DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
-- CREATE POLICY "Authenticated Upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'songs' 
--   AND auth.role() = 'authenticated'
-- );

-- 4. CONFIGURAR RLS POLICY - ACTUALIZACIÓN (Opcional)
-- DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
-- CREATE POLICY "Authenticated Update"
-- ON storage.objects FOR UPDATE
-- USING ( bucket_id = 'songs' AND auth.role() = 'authenticated' )
-- WITH CHECK ( bucket_id = 'songs' AND auth.role() = 'authenticated' );

-- 5. CONFIGURAR RLS POLICY - ELIMINACIÓN (Opcional)
-- DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
-- CREATE POLICY "Authenticated Delete"
-- ON storage.objects FOR DELETE
-- USING ( bucket_id = 'songs' AND auth.role() = 'authenticated' );

-- 6. VERIFICAR CONFIGURACIÓN
SELECT * FROM storage.buckets WHERE id = 'songs';
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
