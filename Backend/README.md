# 🎤 KOACH Backend

Sistema Experto de evaluación vocal (Karaoke Inteligente) - API REST con Node.js, Express, TypeScript y Prisma ORM.

## 🚀 Stack Tecnológico

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Sistema Experto**: DSP + Reglas Heurísticas Musicales

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)

## 🔧 Instalación

### 1. Clonar e instalar dependencias

```bash
cd Backend
npm install
```

### 2. Configurar Supabase

Sigue la guía completa en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Resumen rápido**:

1. Copia `.env.example` a `.env`
2. Completa las credenciales de Supabase
3. Ejecuta `npm run db:push` para sincronizar el schema
4. Crea el bucket `songs` en Supabase Storage

### 3. Generar Prisma Client

```bash
npm run prisma:generate
```

### 4. Sincronizar Base de Datos

**Para desarrollo** (recomendado):
```bash
npm run db:push
```

**Para producción** (con historial de migraciones):
```bash
npm run prisma:migrate
```

### 5. Iniciar servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor en modo desarrollo con hot-reload |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Inicia servidor en producción |
| `npm run db:push` | Sincroniza schema sin migraciones (desarrollo) |
| `npm run db:deploy` | Aplica migraciones pendientes (producción) |
| `npm run db:studio` | Abre Prisma Studio para ver la base de datos |
| `npm run prisma:generate` | Genera Prisma Client |
| `npm run prisma:migrate` | Crea nueva migración |
| `npm run prisma:seed` | Pobla la base de datos con datos de prueba |

## 🗄️ Estructura de la Base de Datos

### Tablas

- **songs**: Canciones disponibles para karaoke
  - Almacena metadatos (título, artista, BPM, tonalidad)
  - `melodyData` (JSON): Notas de referencia para comparación
  - `audioUrl`: URL pública del archivo MP3 en Supabase Storage

- **sessions**: Sesiones de práctica de usuarios
  - Vinculada a una canción
  - Almacena score final y feedback generado

- **performance_logs**: Datos RAW de detección de pitch
  - Vinculada a una sesión (1:1)
  - `rawData` (JSON): Array de frecuencias detectadas

## 🎯 API Endpoints

### Songs

```http
GET    /api/songs          # Listar todas las canciones
GET    /api/songs/:id      # Obtener canción específica (con melodyData)
POST   /api/songs          # Crear nueva canción
DELETE /api/songs/:id      # Eliminar canción
```

**Ejemplo POST /api/songs**:
```json
{
  "title": "Bohemian Rhapsody",
  "artist": "Queen",
  "bpm": 144,
  "key": "Bb",
  "audioFilename": "bohemian-rhapsody.mp3",
  "melodyData": {
    "bpm": 144,
    "key": "Bb Major",
    "notes": [
      {
        "start": 0.5,
        "end": 1.2,
        "note": "Bb4",
        "frequency": 466.16
      }
    ]
  }
}
```

### Performances

```http
POST   /api/performances              # Crear sesión y analizar performance
GET    /api/performances/:id          # Obtener sesión específica
GET    /api/performances/song/:songId # Historial de sesiones de una canción
```

**Ejemplo POST /api/performances**:
```json
{
  "songId": "uuid-xxx",
  "userName": "Juan Pérez",
  "performanceData": [
    {
      "timestamp": 100,
      "detectedFrequency": 465.5,
      "targetFrequency": 466.16,
      "targetNote": "Bb4"
    }
  ]
}
```

**Respuesta**:
```json
{
  "sessionId": "uuid-yyy",
  "score": 85,
  "feedback": [
    "⭐ ¡Excelente afinación! Tu oído es muy preciso.",
    "💎 ¡Estabilidad vocal excelente! Mantienes las notas con firmeza."
  ],
  "analysis": {
    "pitchAccuracy": {
      "score": 88,
      "avgDeviationCents": 12.3,
      "inTunePercentage": 92.5
    },
    "stability": {
      "score": 85,
      "avgJitter": 8.2,
      "stableNotesPercentage": 87.0
    },
    "timing": {
      "score": 90,
      "avgLatency": 0,
      "onTimePercentage": 90
    }
  }
}
```

## 🧠 Sistema Experto

El motor de inferencia analiza performances usando reglas heurísticas musicales:

### Reglas Implementadas

1. **Afinación (Pitch Accuracy)** - Peso: 50%
   - Mide desviación en cents respecto a la nota objetivo
   - Umbral: ±25 cents para considerar "afinado"

2. **Estabilidad Vocal (Stability)** - Peso: 30%
   - Calcula jitter (variación) entre muestras consecutivas
   - Penaliza vibrato excesivo

3. **Timing Métrico** - Peso: 20%
   - Placeholder: requiere onset detection (mejora futura)

### Funciones DSP

Ver [src/utils/dsp.utils.ts](./src/utils/dsp.utils.ts):

- `noteToFrequency()`: Convierte notación científica a Hz
- `frequencyToCents()`: Calcula diferencia en cents
- `isInTune()`: Determina si está afinado (±25 cents)
- `calculateJitter()`: Mide variación vocal
- `calculateStabilityPercentage()`: % de muestras estables

## 💾 Supabase Storage

### Configuración

El servicio [storage.service.ts](./src/services/storage.service.ts) gestiona archivos de audio:

```typescript
import { storageService } from './services/storage.service';

// Obtener URL pública
const url = storageService.getPublicUrl('song.mp3');
// https://xxx.supabase.co/storage/v1/object/public/songs/song.mp3

// Subir archivo (opcional)
const uploadedUrl = await storageService.uploadFile('new-song.mp3', buffer);

// Verificar existencia
const exists = await storageService.fileExists('song.mp3');

// Listar archivos
const files = await storageService.listFiles();
```

### Bucket Configuration

- **Nombre**: `songs`
- **Acceso**: Público (lectura)
- **RLS Policy**: Ver [prisma/supabase-storage-setup.sql](./prisma/supabase-storage-setup.sql)

## 🏗️ Arquitectura

```
src/
├── controllers/          # Lógica de petición/respuesta
│   ├── performance.controller.ts
│   └── song.controller.ts
├── services/            # Lógica de negocio
│   ├── expert-system.service.ts
│   └── storage.service.ts
├── routes/              # Definición de rutas
│   ├── performance.routes.ts
│   └── song.routes.ts
├── lib/                 # Utilidades compartidas
│   └── prisma.ts        # Singleton de Prisma Client
├── utils/               # Funciones auxiliares
│   └── dsp.utils.ts     # Cálculos DSP
├── types/               # Definiciones de tipos
│   └── index.ts
├── config/              # Configuración
│   ├── cors.config.ts
│   └── env.config.ts
└── server.ts            # Punto de entrada
```

## 🔒 Principios de Diseño

- ✅ **SOLID**: Separación de responsabilidades clara
- ✅ **Clean Architecture**: Controllers → Services → Utils
- ✅ **Type Safety**: TypeScript estricto
- ✅ **Error Handling**: Manejo específico de errores de Prisma
- ✅ **Singleton Pattern**: Prisma Client optimizado

## 🧪 Testing (Futuro)

```bash
# Placeholder para tests futuros
npm test
```

## 📖 Documentación Adicional

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Guía completa de configuración
- [prisma/schema.prisma](./prisma/schema.prisma) - Schema de base de datos
- [prisma/supabase-storage-setup.sql](./prisma/supabase-storage-setup.sql) - Scripts SQL

## 🚀 Despliegue a Producción

### 1. Variables de Entorno

Asegúrate de configurar:
- `DATABASE_URL`: Connection Pooler
- `DIRECT_URL`: Direct Connection (para migraciones)
- `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- `NODE_ENV=production`

### 2. Build

```bash
npm run build
```

### 3. Migraciones

```bash
npm run db:deploy
```

### 4. Iniciar

```bash
npm start
```

## 🤝 Contribuir

Este es un proyecto académico. Para contribuir:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT

## 👨‍💻 Autor

Samuel Vega - Proyecto KOACH

---

**¿Necesitas ayuda?** Revisa [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) o abre un issue.
