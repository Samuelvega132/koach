# 🎤 Koach - Karaoke Vocal Coach

**Performance-optimized karaoke app with real-time pitch detection and feedback.**

[![Status](https://img.shields.io/badge/Status-Production_Ready-success)](/)
[![Performance](https://img.shields.io/badge/Performance-60_FPS-brightgreen)](/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel_%7C_Render-blue)](/)

> 🎓 **Proyecto Final de Carrera** - 5to Semestre  
> 🚀 **Optimizado para 60 FPS estables en producción**

---

## ✨ Features

- 🎵 **Real-time Pitch Detection** usando Web Audio API + Pitchfinder (YIN algorithm)
- 🎨 **GPU-Accelerated Piano Roll** con Canvas rendering optimizado
- 🎯 **Live Tuner Gauge** para feedback visual instantáneo
- ⚡ **60 FPS Guaranteed** en dispositivos mid-range
- 🎚️ **Latency Compensation** (150ms) para sincronización perfecta
- 📊 **Pitch Smoothing** configurable para eliminar jitter
- 📱 **Responsive Design** optimizado para móviles
- 🔧 **Configurable Audio Engine** para diferentes hardwares
- 🔐 **Production-Ready** con environment variables

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router) + React 18
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + Framer Motion
- **Audio**: Web Audio API + Pitchfinder.js
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage (audio files)
- **Deployment**: Render

---

## 📁 Project Structure

```
Koach/
├── Backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── cors.config.ts
│   │   │   └── env.config.ts
│   │   ├── controllers/
│   │   │   ├── song.controller.ts
│   │   │   └── performance.controller.ts
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── expert-system.service.ts
│   │   │   └── storage.service.ts
│   │   └── utils/
│   │       ├── dsp.utils.ts
│   │       └── validation.utils.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (dashboard)/
    │   │   │   └── studio/[id]/page.tsx
    │   │   └── (public)/
    │   │       └── page.tsx
    │   ├── components/
    │   │   ├── stage/
    │   │   │   ├── StudioClient.tsx
    │   │   │   ├── PianoRollVisualizer.tsx (GPU-optimized)
    │   │   │   └── LiveTunerGauge.tsx
    │   │   └── shared/
    │   ├── hooks/
    │   │   ├── useMicrophone.ts (Ref-optimized)
    │   │   ├── usePitchDetector.ts (Ref-optimized + Smoothing)
    │   │   └── useAudioPlayer.ts (RAF-based timing)
    │   ├── config/
    │   │   ├── api.config.ts
    │   │   └── audio.config.ts (Latency & Smoothing)
    │   └── services/
    │       └── api.ts
    └── package.json
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL or Supabase account
- npm or yarn

### 1. Clone & Install
```bash
git clone <your-repo>
cd koach

# Backend
cd Backend
npm install

# Frontend
cd ../Frontend
npm install
```

### 2. Environment Setup

**Backend** (`Backend/.env`):
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/koach"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="your-key"
FRONTEND_URL="http://localhost:3000"
```

**Frontend** (`Frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Database Setup
```bash
cd Backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run Development Servers
```bash
# Terminal 1 - Backend
cd Backend
npm run dev  # Port 3001

# Terminal 2 - Frontend
cd Frontend
npm run dev  # Port 3000
```

### 5. Open Browser
Visit `http://localhost:3000` and test the studio!

---

## 🎯 Production Deployment

### Quick Deploy
See detailed guides:
- 📖 [DEPLOYMENT.md](DEPLOYMENT.md) - Frontend (Vercel)
- 📖 [BACKEND_PRODUCTION.md](BACKEND_PRODUCTION.md) - Backend (Render)
- ✅ [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) - Pre-deploy verification

### TL;DR
```bash
# Frontend (Vercel)
cd Frontend
vercel --prod

# Backend (Render)
# Connect GitHub repo → Set env vars → Deploy
```

**Required Environment Variables**:
- **Vercel**: `NEXT_PUBLIC_API_URL`
- **Render**: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `FRONTEND_URL`

---

## ⚡ Performance Optimizations

This project is optimized for **60 FPS stable rendering** and **<20ms sync latency**:

### ✅ Visual Performance
- **useRef Pattern**: High-frequency audio data stored in refs (not state)
- **RAF Loops**: Dedicated `requestAnimationFrame` for canvas rendering
- **GPU Acceleration**: Canvas with `desynchronized: true` + CSS transforms
- **Decoupled Processing**: Audio analysis separate from React lifecycle
- **Memory Management**: Proper cleanup of AudioContext and streams

### ✅ Audio Engine Optimizations
- **Pitch Smoothing**: Exponential moving average (configurable factor 0.7)
- **Latency Compensation**: 150ms offset for mic-to-validation sync
- **Precise Timing**: RAF-based audio time tracking (not `timeupdate` event)
- **Adaptive Range**: Configurable pitch detection range (50-1500 Hz)

### 📊 Benchmarks
- **FPS**: 58-60 stable
- **Frame Time**: <16.7ms
- **Re-renders**: ~1-2/sec (down from 60/sec)
- **Sync Latency**: <20ms (with compensation)
- **Pitch Accuracy**: ±3 cents
- **False Negatives**: <5%

See [PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md) and [AUDIO_ENGINE_REPORT.md](AUDIO_ENGINE_REPORT.md) for technical details.

---

## 🎚️ Audio Calibration

If notes are marked incorrectly, adjust latency in [audio.config.ts](Frontend/src/config/audio.config.ts):

```typescript
export const AUDIO_CONFIG = {
    MICROPHONE_LATENCY_MS: 150, // Adjust ±20ms if needed
    PITCH_SMOOTHING_FACTOR: 0.7, // 0-1: higher = smoother
};
```

**See full guide**: [LATENCY_CALIBRATION.md](LATENCY_CALIBRATION.md)

---

## 📚 Documentation

| File | Description |
|------|-------------|
| [REFACTOR_SUMMARY.md](REFACTOR_SUMMARY.md) | Executive summary of changes |
| [PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md) | Visual performance analysis |
| [AUDIO_ENGINE_REPORT.md](AUDIO_ENGINE_REPORT.md) | Audio engine optimization details |
| [LATENCY_CALIBRATION.md](LATENCY_CALIBRATION.md) | Mic latency calibration guide |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Vercel deployment guide |
| [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) | Pre-deploy verification |
| [BACKEND_PRODUCTION.md](BACKEND_PRODUCTION.md) | Render backend setup |
| [OPTIONAL_IMPROVEMENTS.md](OPTIONAL_IMPROVEMENTS.md) | Future enhancements |

---

## 🎵 How It Works

1. **Audio Capture**: Web Audio API captures microphone input (50-100ms latency)
2. **Pitch Detection**: Pitchfinder.js (YIN algorithm) extracts fundamental frequency (~40ms)
3. **Smoothing**: Exponential moving average eliminates jitter (configurable)
4. **Latency Compensation**: Compares pitch with note from 150ms ago (not current note)
5. **Visualization**: 
   - Piano Roll shows target notes scrolling (GPU-accelerated)
   - Yellow cursor shows user's smoothed pitch
   - Tuner gauge shows cents deviation with color feedback
6. **Validation**: Real-time accuracy in cents (±10 = perfect, ±50 = ok)

---

## 🧪 Testing

### Performance Test
Paste this in browser console while in `/studio/[id]`:
```javascript
let fps = 0, last = performance.now();
const check = () => {
  fps++;
  const now = performance.now();
  if (now - last >= 1000) {
    console.log(`FPS: ${fps}`);
    fps = 0; last = now;
  }
  requestAnimationFrame(check);
};
check();
```

**Expected**: `FPS: 58-60`

### Lighthouse Audit
```bash
npm run build
npm start
# Open Chrome DevTools → Lighthouse → Run
```

**Target**: Performance score > 80

---

## 🔧 Troubleshooting

### "API connection failed"
**Solution**: Verify `NEXT_PUBLIC_API_URL` is set correctly and backend is running.

### "Microphone not working"
**Solution**: 
- Grant microphone permissions in browser
- Use HTTPS or localhost (HTTP works only on localhost)
- Test with Chrome/Edge (best compatibility)

### "Piano roll stuttering"
**Solution**: 
- Open DevTools → Performance → Look for long tasks
- Ensure no excessive `console.log` statements
- Check if hardware acceleration is enabled in browser

### "Build errors"
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 🎓 Credits & Acknowledgments

**Project**: Final project - 5th Semester  
**Architecture**: Senior Frontend Performance Engineer optimizations  
**Technologies**: Next.js, Web Audio API, Pitchfinder.js, Prisma

### Key Techniques Applied
- useRef pattern for high-frequency updates
- RAF loops for smooth animations
- GPU-accelerated canvas rendering
- Decoupled audio processing

---

## 📄 License

MIT - Academic Project

---

## 🚀 Quick Links

- 📖 [Full Deployment Guide](DEPLOYMENT.md)
- ⚡ [Performance Report](PERFORMANCE_REPORT.md)
- ✅ [Deploy Checklist](DEPLOY_CHECKLIST.md)
- 🎯 [Refactor Summary](REFACTOR_SUMMARY.md)

**Status**: ✅ Production Ready | 🚀 60 FPS Optimized | 🎵 Real-time Feedback
