# 🎤 KOACH Backend - Guía de Configuración Supabase

Esta guía te ayudará a configurar completamente la infraestructura de Supabase para el proyecto KOACH.

---

## 📋 Requisitos Previos

1. Cuenta en [Supabase](https://supabase.com)
2. Proyecto creado en Supabase
3. Node.js instalado

---

## 🔧 PASO 1: Configurar Variables de Entorno

### 1.1 Crear archivo `.env`

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

### 1.2 Obtener Credenciales de Supabase

Ve a tu proyecto en Supabase Dashboard:

#### **Database URLs**
1. Ve a **Settings** → **Database**
2. En la sección **Connection String**, encontrarás:

**Connection Pooler (puerto 6543)**:
```
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Direct Connection (puerto 5432)**:
```
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

#### **Storage Credentials**
1. Ve a **Settings** → **API**
2. Copia:
   - **URL**: `https://[PROJECT_REF].supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.3 Completar `.env`

```bash
# Database
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Storage
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Server
PORT=3000
NODE_ENV=development
```

---

## 🗄️ PASO 2: Sincronizar Schema de Base de Datos

### 2.1 Generar Prisma Client

```bash
npm run prisma:generate
```

### 2.2 Sincronizar Schema (Desarrollo)

Para desarrollo, usa `db:push` que es más rápido y no requiere historial de migraciones:

```bash
npm run db:push
```

Este comando:
- ✅ Sincroniza el schema con Supabase
- ✅ Funciona con Connection Pooler (puerto 6543)
- ✅ No requiere Shadow Database
- ⚠️ No crea historial de migraciones

### 2.3 Verificar Tablas Creadas

1. Ve a **Table Editor** en Supabase Dashboard
2. Deberías ver las tablas:
   - `songs`
   - `sessions`
   - `performance_logs`

**Alternativa**: Usa Prisma Studio para ver las tablas localmente:

```bash
npm run db:studio
```

---

## 💾 PASO 3: Configurar Supabase Storage

### 3.1 Crear Bucket Público

1. Ve a **Storage** en Supabase Dashboard
2. Click en **Create Bucket**
3. Configuración:
   - **Name**: `songs`
   - ✅ **Public bucket** (marcar checkbox)
   - Click **Create bucket**

### 3.2 Configurar RLS Policy (Row Level Security)

1. Ve a **Storage** → **Policies**
2. Click en **New Policy**
3. Selecciona **For full customization**
4. Configuración:
   - **Policy name**: `Public Access`
   - **Allowed operation**: `SELECT`
   - **Policy definition**:
     ```sql
     bucket_id = 'songs'
     ```
5. Click **Save**

**Alternativa (SQL Editor)**:

Ve a **SQL Editor** y ejecuta:

```sql
-- Permitir lectura pública de archivos en el bucket 'songs'
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'songs' );
```

### 3.3 Subir Archivos de Prueba

1. Ve a **Storage** → **songs**
2. Click **Upload file**
3. Sube un archivo `.mp3` de prueba (ej: `test-song.mp3`)
4. Click en el archivo → **Get public URL**
5. Copia la URL y prueba en el navegador

La URL debe tener este formato:
```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/songs/test-song.mp3
```

---

## 🧪 PASO 4: Verificar Configuración

### 4.1 Probar Conexión a Base de Datos

```bash
# Abrir Prisma Studio
npm run db:studio
```

Deberías ver las tablas vacías en `http://localhost:5555`

### 4.2 Probar Storage Service

Crea un archivo de prueba `test-storage.ts`:

```typescript
// test-storage.ts
import { storageService } from './src/services/storage.service';
import dotenv from 'dotenv';

dotenv.config();

const url = storageService.getPublicUrl('test-song.mp3');
console.log('✅ Storage URL:', url);
```

Ejecuta:

```bash
npx ts-node test-storage.ts
```

Deberías ver:
```
✅ Storage URL: https://xxx.supabase.co/storage/v1/object/public/songs/test-song.mp3
```

### 4.3 Iniciar Servidor

```bash
npm run dev
```

El servidor debería iniciar sin errores en `http://localhost:3000`

---

## 📚 PASO 5: Poblar Base de Datos (Opcional)

### 5.1 Ejecutar Seed

Si tienes un archivo `prisma/seed.ts`, ejecuta:

```bash
npm run prisma:seed
```

### 5.2 Crear Canción de Prueba (API)

Usa Postman, Thunder Client o curl:

```bash
POST http://localhost:3000/api/songs
Content-Type: application/json

{
  "title": "Test Song",
  "artist": "Test Artist",
  "bpm": 120,
  "key": "C",
  "audioFilename": "test-song.mp3",
  "melodyData": {
    "bpm": 120,
    "key": "C Major",
    "notes": [
      {
        "start": 0,
        "end": 1,
        "note": "C4",
        "frequency": 261.63
      }
    ]
  }
}
```

Respuesta esperada:

```json
{
  "id": "uuid-xxx",
  "title": "Test Song",
  "artist": "Test Artist",
  "bpm": 120,
  "key": "C",
  "audioUrl": "https://xxx.supabase.co/storage/v1/object/public/songs/test-song.mp3",
  "melodyData": { ... },
  "createdAt": "2026-01-22T...",
  "updatedAt": "2026-01-22T..."
}
```

---

## 🚀 PASO 6: Preparar para Producción (Futuro)

### 6.1 Crear Migraciones Versionadas

Cuando estés listo para producción, usa la Direct Connection:

1. Asegúrate de tener `DIRECT_URL` en `.env`
2. Ejecuta:

```bash
npm run prisma:migrate
```

Esto creará archivos SQL en `prisma/migrations/` con historial versionado.

### 6.2 Desplegar Migraciones en CI/CD

En tu pipeline de CI/CD (GitHub Actions, etc.):

```bash
npm run db:deploy
```

Este comando aplica migraciones pendientes sin crear nuevas.

---

## ✅ Checklist de Configuración

- [ ] Archivo `.env` creado con credenciales de Supabase
- [ ] `npm install` ejecutado correctamente
- [ ] `npm run prisma:generate` ejecutado
- [ ] `npm run db:push` sincronizó el schema
- [ ] Bucket `songs` creado como público
- [ ] RLS Policy configurada para lectura pública
- [ ] Archivo `.mp3` de prueba subido al bucket
- [ ] `npm run db:studio` muestra las tablas
- [ ] `npm run dev` inicia el servidor sin errores
- [ ] Endpoint `POST /api/songs` funciona correctamente

---

## 🆘 Troubleshooting

### Error: "Connection timeout"

**Causa**: Problemas de red con Connection Pooler

**Solución**:
```bash
# Aumenta el timeout en DATABASE_URL
DATABASE_URL="...?pgbouncer=true&connection_limit=1&pool_timeout=30"
```

### Error: "Missing Supabase credentials"

**Causa**: Variables de entorno no cargadas

**Solución**:
```bash
# Verifica que .env existe y tiene las variables correctas
cat .env

# Asegúrate de importar dotenv en server.ts
import dotenv from 'dotenv';
dotenv.config();
```

### Error: "Bucket not found"

**Causa**: Bucket no creado o nombre incorrecto

**Solución**:
1. Ve a Storage en Supabase Dashboard
2. Verifica que el bucket se llama exactamente `songs`
3. Verifica que está marcado como **Public**

### Error: "Access denied to storage object"

**Causa**: RLS Policy no configurada

**Solución**:
```sql
-- Ejecuta en SQL Editor
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'songs' );
```

---

## 📖 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Prisma con Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

¡Configuración completa! 🎉
