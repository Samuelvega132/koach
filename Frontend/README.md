# KOACH Frontend

Coach virtual de canto con análisis en tiempo real. Este es el cliente web que se conecta al backend con el motor de inferencia Prolog.

## Stack Técnico

- **Next.js 14** - App Router (no usamos Pages Router)
- **React 18** - Server Components donde tiene sentido, Client Components para interactividad
- **TypeScript** - Todo está tipado (bueno, casi todo)
- **Tailwind CSS** - Utility-first, con tema dark por defecto
- **Framer Motion** - Animaciones smooth
- **Chart.js + react-chartjs-2** - Gráficas de radar para análisis vocal
- **Tone.js** - Reproducción de audio y síntesis
- **Pitchfinder** - Detección de pitch en tiempo real usando YIN algorithm
- **html2canvas + jsPDF** - Export análisis a PDF con alta resolución
- **Zod** - Validación de schemas en runtime

## Instalación Local

```bash
cd Frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:3000` y se conecta al backend en `http://localhost:3001`.

## Arquitectura de Rutas

### Públicas (sin login)
- `/` - Landing page con hero, features y CTA
- `/songs` - Biblioteca de canciones disponibles
- `/results/[sessionId]` - Vista de análisis post-sesión (puede usarse sin login)

### Protegidas (requieren autenticación)
- `/studio/[songId]` - Estudio de práctica con micrófono en vivo
- `/profile` - Perfil del usuario con historial de sesiones

El sistema de autenticación:
- **NO** bloquea rutas públicas
- **SÍ** guarda sesiones solo si estás logueado
- Usa JWT tokens (access token 24h, refresh token 7 días)
- Tokens en localStorage + refresh automático

## Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Grupo de rutas públicas
│   │   ├── page.tsx       # Landing page (/)
│   │   ├── songs/         # Biblioteca de canciones
│   │   └── results/       # Vista de análisis
│   ├── (dashboard)/       # Grupo de rutas protegidas
│   │   └── studio/        # Estudio de práctica
│   ├── profile/           # Perfil de usuario
│   ├── layout.tsx         # Layout global (Navbar, AuthProvider)
│   └── globals.css        # Estilos base + tema Tailwind
│
├── components/            # Componentes React
│   ├── auth/             # AuthModal, ProtectedRoute
│   ├── charts/           # PerformanceRadar
│   ├── profile/          # ProfileHeader, SessionCard, VocalRangeWizard
│   ├── results/          # DiagnosisCard, PrescriptionCard
│   ├── shared/           # Navbar
│   ├── stage/            # StudioClient, PianoRollVisualizer, LiveTunerGauge
│   ├── ui/               # Button, Card, Input, Badge, Toast (componentes base)
│   └── SongCard.tsx      # Tarjeta de canción individual
│
├── hooks/                # Custom React Hooks
│   ├── useAudioPlayer.ts        # Reproduce MIDI usando Tone.js
│   ├── useMicrophone.ts         # Captura audio del mic
│   ├── usePitchDetector.ts      # Detecta pitch en tiempo real
│   ├── usePerformanceSubmit.ts  # Envía datos al backend
│   └── useSessionTelemetry.ts   # Calcula métricas de telemetría
│
├── contexts/
│   └── AuthContext.tsx   # Estado global de autenticación
│
├── services/
│   └── api.ts           # Cliente HTTP (fetch wrapper)
│
├── config/
│   ├── api.config.ts    # URLs del backend, endpoints
│   └── audio.config.ts  # Configuración de audio (sample rate, FFT size)
│
├── types/
│   └── index.ts         # Tipos TypeScript compartidos
│
└── utils/
    └── noteUtils.ts     # Conversión MIDI ↔ Frequency ↔ Note Names
```

## Componentes Clave

### StudioClient (`components/stage/StudioClient.tsx`)

El corazón de la app. Componente client-side que:

1. **Carga el MIDI** de la canción con Tone.js
2. **Captura audio** del micrófono con getUserMedia
3. **Detecta pitch** en tiempo real con pitchfinder (algoritmo YIN)
4. **Visualiza** el piano roll con las notas esperadas vs cantadas
5. **Calcula métricas** (RMS deviation, stability, timing offset)
6. **Envía análisis** al backend cuando terminas de cantar

Estado interno:
```typescript
{
  isRecording: boolean,           // ¿Está grabando?
  currentTime: number,            // Posición en la canción
  detectedPitch: number | null,   // Pitch detectado (Hz)
  userPerformance: PitchPoint[],  // Historial de pitches cantados
  expectedNotes: NoteEvent[],     // Notas del MIDI parseado
}
```

### PianoRollVisualizer (`components/stage/PianoRollVisualizer.tsx`)

Visualización en tiempo real tipo Guitar Hero:
- **Canvas** para renderizado eficiente
- **Notas esperadas** (barras grises que se mueven)
- **Tu voz** (línea amarilla superpuesta)
- **Indicador de tiempo** (línea vertical)

Técnica: Usa `requestAnimationFrame` para 60 FPS sin lags.

### SessionCard (`components/profile/SessionCard.tsx`)

Tarjeta expandible en el perfil que muestra:
- Score general
- Diagnóstico principal (badge de severidad)
- Prescripciones de ejercicios
- Telemetría detallada (RMS, stability, timing)
- **Raw JSON viewer** con botón "Copiar" (para debugging)

### AuthModal (`components/auth/AuthModal.tsx`)

Modal de login/registro con:
- Tabs para alternar entre Login y Sign Up
- Validación en tiempo real
- Manejo de errores del backend
- Auto-cierre tras login exitoso
- Refresh del estado global con AuthContext

## Custom Hooks Explicados

### `usePitchDetector`

Detecta pitch del micrófono cada ~100ms:

```typescript
const { detectedPitch, startDetection, stopDetection } = usePitchDetector();
```

Internamente:
1. Usa `AudioContext` y `ScriptProcessorNode`
2. Alimenta el buffer de audio a **pitchfinder.YIN()** (autocorrelación)
3. Filtra frecuencias fuera de rango vocal (80-800 Hz)
4. Devuelve `null` si no detecta nada claro

**Truco:** Agregamos filtrado de outliers en el backend (>300 cents), pero aquí también filtramos ruido.

### `useAudioPlayer`

Reproduce el MIDI instrumental:

```typescript
const { play, pause, stop, currentTime, duration } = useAudioPlayer(midiUrl);
```

Usa Tone.js:
- **PolySynth** para notas MIDI
- **Transport** para timing preciso
- **Part** para secuenciar eventos

El player se auto-detiene al final de la canción.

### `useSessionTelemetry`

Calcula todas las métricas después de cantar:

```typescript
const telemetry = useSessionTelemetry({
  performanceLog: userPerformance,
  expectedNotes: midiNotes,
  duration: songDuration,
});
```

Devuelve:
```typescript
{
  pitchAccuracy: number,      // Score 0-100
  stabilityScore: number,     // Qué tan estable cantaste
  timingScore: number,        // Si entraste a tiempo
  overallScore: number,       // Promedio ponderado
  diagnosis: string,          // "Afinación Inestable", etc.
  pitchDeviation: number,     // RMS en cents
  rhythmOffset: number,       // Offset promedio en ms
}
```

Este hook **NO** envía datos al backend, solo calcula. El envío lo hace `usePerformanceSubmit`.

### `usePerformanceSubmit`

Envía la sesión al backend:

```typescript
const { submitPerformance, isSubmitting } = usePerformanceSubmit(onSuccess);

await submitPerformance({
  songId,
  telemetry,
  performanceLog,
});
```

Incluye:
- **Bearer token** en headers (si estás logueado)
- **Retry logic** si falla
- Callback `onSuccess` para mostrar Toast

## Flujo de Usuario Completo

### 1. Landing → Selección de Canción

```
/ (Landing) 
  ↓ Click "Comenzar"
/songs (Biblioteca)
  ↓ Click en SongCard
/studio/[songId]
```

### 2. Práctica en Estudio

```
StudioClient se monta
  ↓
Carga MIDI con useAudioPlayer
  ↓
Usuario click "Grabar"
  ↓ startDetection()
useMicrophone captura audio
  ↓ cada 100ms
usePitchDetector analiza → detectedPitch
  ↓ guardado en array
userPerformance = [{time, frequency}...]
  ↓
PianoRollVisualizer renderiza en tiempo real
  ↓
Usuario click "Detener"
  ↓ stopDetection()
useSessionTelemetry calcula métricas
  ↓
usePerformanceSubmit envía al backend
  ↓ POST /api/submit-performance
Backend responde con sessionId
  ↓
Router.push(/results/[sessionId])
```

### 3. Vista de Resultados

```
/results/[sessionId]
  ↓
Fetch session data
  ↓
DiagnosisCard muestra diagnóstico Prolog
PrescriptionCard muestra ejercicios
PerformanceRadar visualiza métricas
  ↓
Si logueado: "Guardado en tu perfil ✅"
Si invitado: "Inicia sesión para guardar historial"
```

### 4. Perfil (Solo Logueados)

```
/profile
  ↓
ProfileHeader muestra stats agregadas
  ↓
SessionCard list (todas tus sesiones)
  ↓ Click expandir
Muestra diagnosis + telemetry + raw JSON
```

## Autenticación (JWT)

### Flow de Login

```typescript
// 1. Usuario ingresa email/password
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// 2. Backend devuelve tokens
{
  accessToken: "jwt...",  // 24h
  refreshToken: "jwt...", // 7 días
  user: { id, email, name }
}

// 3. Frontend guarda en localStorage
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 4. AuthContext actualiza estado global
setUser(user);
setIsAuthenticated(true);
```

### Refresh Automático

Si el access token expiró (403 del backend):

```typescript
// api.ts intercepta 403
if (response.status === 403) {
  const newAccessToken = await refreshAccessToken();
  // Reintenta el request original con nuevo token
}
```

### Logout

```typescript
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
setUser(null);
setIsAuthenticated(false);
```

## Configuración de Audio

`config/audio.config.ts`:

```typescript
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100,           // Hz (estándar CD quality)
  FFT_SIZE: 2048,              // Tamaño de buffer para FFT
  DETECTION_INTERVAL: 100,      // ms entre detecciones
  MIN_VOCAL_FREQ: 80,          // Hz (nota más grave: E2)
  MAX_VOCAL_FREQ: 800,         // Hz (nota más aguda: G5)
  SMOOTHING_FACTOR: 0.8,       // Reducción de jitter
};
```

**Nota importante:** El `DETECTION_INTERVAL` de 100ms es un balance entre precisión y performance. Si lo bajas a 50ms, tendrás más puntos pero mayor lag en browsers lentos.

## API Endpoints Usados

`config/api.config.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ROUTES = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  
  // Songs
  SONGS: '/api/songs',
  SONG_BY_ID: (id: string) => `/api/songs/${id}`,
  
  // Performance
  SUBMIT: '/api/submit-performance',
  SESSION: (id: string) => `/api/sessions/${id}`,
  MY_SESSIONS: '/api/sessions/me',
  
  // Stats
  MY_STATS: '/api/auth/me/stats',
};
```

## Sistema de Diagnóstico Visual

### Severity Badges

```typescript
{
  mild: "bg-blue-500/10 text-blue-400",
  moderate: "bg-yellow-500/10 text-yellow-400",
  severe: "bg-red-500/10 text-red-400",
}
```

Los badges se muestran en:
- `DiagnosisCard` (resultados)
- `SessionCard` (perfil)

### Performance Radar Chart

5 dimensiones visualizadas en gráfica de radar:
- **Pitch Accuracy** (afinación)
- **Stability** (control vocal)
- **Timing** (ritmo)
- **Range Coverage** (cobertura de rango)
- **Consistency** (consistencia)

Cada una de 0 a 100. El área total del polígono representa tu nivel general.

## Datos de Telemetría

El objeto `performanceLog` que enviamos al backend:

```typescript
{
  rawData: PitchPoint[],  // [{time: 1.23, frequency: 440, cents: -5, noteNumber: 69}...]
  totalPoints: number,    // Cantidad de detecciones
  validPoints: number,    // Puntos dentro de rango vocal
  payloadSize: string,    // Ej: "126.55 kB"
  startTime: number,      // Unix timestamp ms
}
```

El backend usa `rawData` para calcular:
- **RMS deviation** (pitch_deviation_cents)
- **Stability variance** (stability_variance)
- **Timing offset** (rhythm_offset_ms)
- **Notas altas/bajas** (notas_altas, notas_bajas)

Estos se convierten en hechos Prolog que alimentan el motor de inferencia.

## Toast Notifications

Sistema de feedback visual:

```typescript
const [showToast, setShowToast] = useState(false);

// Mostrar toast
setShowToast(true);

// Se auto-oculta después de 3s
setTimeout(() => setShowToast(false), 3000);
```

Tipos de toast:
- **Success** (verde) - "¡Análisis guardado en tu perfil!"
- **Warning** (amarillo) - "Inicia sesión para guardar tu historial"
- **Error** (rojo) - "Error al enviar datos"

## Optimizaciones de Performance

### 1. Canvas Rendering

`PianoRollVisualizer` usa canvas nativo en vez de SVG porque:
- SVG = 1000+ elementos DOM = lag
- Canvas = 1 elemento + JS draw = smooth 60 FPS

### 2. Pitch Detection Throttling

Detectamos pitch cada 100ms en vez de cada frame:
```typescript
setInterval(() => {
  const pitch = detectPitch(audioBuffer);
  if (pitch) userPerformance.push({time, frequency: pitch});
}, 100);
```

### 3. Lazy Loading de Componentes

Charts solo se cargan cuando son visibles:
```typescript
import dynamic from 'next/dynamic';
const PerformanceRadar = dynamic(() => import('./PerformanceRadar'), {
  ssr: false,
  loading: () => <div>Cargando...</div>
});
```

### 4. Memoización

Componentes pesados están memorizados:
```typescript
const NoteVisualization = React.memo(({ notes }) => {
  // ...rendering pesado
}, (prev, next) => prev.notes === next.notes);
```

## Errores Comunes y Cómo Solucionarlos

### "Microphone permission denied"

El navegador bloqueó acceso al mic. Solución:
1. Verifica HTTPS (localhost es OK)
2. Click en el candado de la URL
3. Permite micrófono para el sitio

### "Token expired" en profile

El access token expiró y el refresh falló. Solución:
```typescript
// AuthContext maneja esto automáticamente
// Si ves el error, significa que AMBOS tokens expiraron
// Usuario debe hacer login de nuevo
```

### "No pitch detected" aunque estás cantando

Posibles causas:
1. **Volumen muy bajo** - Habla más fuerte o acércate al mic
2. **Micrófono equivocado** - Verifica settings del navegador
3. **Ruido de fondo** - El algoritmo YIN falla con mucho ruido
4. **Frecuencia fuera de rango** - Estás cantando <80 Hz o >800 Hz

### "Performance not saved to profile"

Causas:
1. No estás logueado (modo invitado)
2. Token expiró durante la sesión
3. Backend caído

Check en consola:
```javascript
console.log('Token:', localStorage.getItem('accessToken'));
```

## Testing Manual

### Checklist de QA

**Landing & Navegación:**
- [ ] Landing page carga con animaciones smooth
- [ ] Click "Comenzar" navega a /songs
- [ ] Navbar muestra "Login" si no estás autenticado
- [ ] Navbar muestra email + Perfil si estás autenticado

**Biblioteca de Canciones:**
- [ ] Se cargan todas las canciones del backend
- [ ] SongCard muestra título, artista, dificultad
- [ ] Click en canción navega a /studio/[songId]
- [ ] Botón "Volver" funciona

**Estudio de Práctica:**
- [ ] MIDI se carga y muestra duración
- [ ] Click "Reproducir" inicia audio instrumental
- [ ] Click "Grabar" pide permiso de micrófono (primera vez)
- [ ] PianoRoll muestra notas moviéndose
- [ ] LiveTunerGauge muestra pitch en tiempo real
- [ ] Al terminar, se calcula score y navega a /results

**Resultados:**
- [ ] DiagnosisCard muestra severidad correcta
- [ ] Prescripciones se muestran numeradas
- [ ] PerformanceRadar se renderiza sin errors
- [ ] Si logueado: Toast "Guardado en tu perfil"
- [ ] Si invitado: AuthModal aparece al click "Guardar"

**Perfil (solo logueados):**
- [ ] ProfileHeader muestra stats totales
- [ ] SessionCard list carga todas las sesiones
- [ ] Click "Expandir" muestra telemetry
- [ ] Click "Ver JSON" muestra raw data
- [ ] Botón "Copiar JSON" funciona

**Autenticación:**
- [ ] Login con credenciales válidas funciona
- [ ] Login con credenciales inválidas muestra error
- [ ] Registro de nuevo usuario funciona
- [ ] Token se guarda en localStorage
- [ ] Refresh token automático funciona (simula 403)
- [ ] Logout limpia estado y navega a /

## Variables de Entorno

Crea `.env.local` en la raíz del frontend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

En producción (Vercel, Netlify, etc.):
```bash
NEXT_PUBLIC_API_URL=https://api.koach.app
```

**Importante:** Variables con `NEXT_PUBLIC_` son expuestas al navegador. No pongas secrets aquí.

## Build para Producción

```bash
npm run build
npm run start
```

Next.js generará:
- **Static pages** - Landing, songs (SSG)
- **Dynamic pages** - Studio, results (SSR)
- **Client bundles** - Optimizados y code-split

El build tarda ~2 min porque procesa:
- TypeScript compilation
- Tailwind CSS purging
- Image optimization
- Route analysis

## Tips de Desarrollo

1. **Hot Reload** - Guarda archivos y Next.js recarga automáticamente. Si algo se rompe, reinicia el dev server.

2. **TypeScript Errors** - Si el build falla por tipos, revisa `types/index.ts`. A veces el backend cambió la forma de la data.

3. **Tailwind IntelliSense** - Instala la extensión de VS Code para autocompletado de clases.

4. **Console Logs** - Dejamos MUCHOS logs en desarrollo. Para production, agregar un toggle:
   ```typescript
   const DEBUG = process.env.NODE_ENV === 'development';
   if (DEBUG) console.log(...);
   ```

5. **Depurar Audio Issues** - Abre Chrome DevTools → Sources → Debugger. Pon breakpoint en `usePitchDetector` y revisa el buffer.

6. **Mock del Backend** - Si el backend está caído, puedes mockear responses en `services/api.ts`:
   ```typescript
   if (MOCK_MODE) {
     return Promise.resolve(mockData);
   }
   ```

## Próximas Features (TODO)

- [ ] **Dark/Light mode toggle** - Actualmente solo dark mode
- [ ] **Compartir resultados** - Link público para compartir sesiones
- [ ] **Video recording** - Grabar video mientras cantas
- [ ] **Multiplayer sessions** - Cantar con amigos en tiempo real
- [ ] **Custom songs** - Upload tus propios MIDI
- [ ] **Practice mode** - Loop de secciones específicas
- [ ] **Vocal warmups** - Ejercicios guiados pre-canto
- [ ] **Achievements system** - Badges por logros
- [ ] **Leaderboards** - Ranking de mejores scores por canción

## Preguntas Frecuentes

**¿Por qué Next.js y no Create React App?**

Next.js nos da SSR gratis, mejor SEO, Image optimization, y API routes si las necesitamos. CRA está deprecated.

**¿Por qué no usamos Redux?**

Context API + hooks es suficiente para este proyecto. Solo tenemos 1 estado global (AuthContext). Redux sería overkill.

**¿Funcionará en mobile?**

Sí, pero el performance de pitch detection es mejor en desktop. Mobile tiene limitaciones de `getUserMedia` en algunos browsers.

**¿Puedo usar otro algoritmo de pitch detection?**

Sí, pitchfinder soporta varios: YIN, AMDF, McLeod. YIN es el más preciso pero más costoso computacionalmente.

**¿Los datos quedan almacenados localmente?**

No, todo se envía al backend. Si estás offline, la app no funciona. Podríamos agregar IndexedDB para modo offline.

---

**¿Dudas?** Revisa el código, los comentarios están en español y son bastante detallados. Si algo no tiene sentido, probablemente sea un bug 🐛
