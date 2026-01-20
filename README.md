# 🎤 Koach - Karaoke Coach Vocal

Proyecto académico de 5to semestre.

## 📋 Descripción

Sistema de karaoke con retroalimentación vocal automatizada usando:
- **Frontend**: Next.js 14 + Web Audio API + ml5.js (detección de pitch)
- **Backend**: Express + Prisma + PostgreSQL (análisis vocal)

---

## 🛠️ Stack Tecnológico

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Zod (validación)

### Frontend
- Next.js 14 + React + TypeScript
- Tailwind CSS
- ml5.js (vía CDN)

---

## 📁 Estructura

```
Koach/
├── Backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
│
└── Frontend/
    ├── app/
    │   ├── page.tsx
    │   └── practice/[songId]/page.tsx
    ├── components/
    ├── hooks/
    ├── lib/
    └── package.json
```

---

## 🚀 Instalación Rápida

### Opción 1: Script Automático (PowerShell)
```powershell
.\CLEAN_INSTALL.ps1
```

### Opción 2: Manual

**1. Backend:**
```powershell
cd Backend
npm install
# Configurar .env con DATABASE_URL="postgresql://..."
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev  # Puerto 3001
```

**2. Frontend:**
```powershell
cd Frontend
npm install
# Configurar .env.local con NEXT_PUBLIC_API_URL="http://localhost:3001"
npm run dev  # Puerto 3000
```

---

## 🎯 API Endpoints

### Songs
- `GET /api/songs` - Listar canciones
- `GET /api/songs/:id` - Obtener canción con melodyData
- `POST /api/songs` - Crear canción
- `DELETE /api/songs/:id` - Eliminar canción

### Performances
- `POST /api/performances` - Analizar performance
- `GET /api/performances/:id` - Obtener resultado
- `GET /api/performances/song/:songId` - Historial por canción

---

## 📦 Base de Datos

### Song Model
```typescript
{
  id: string
  title: string
  artist: string
  melodyData: {
    bpm: number
    key: string
    notes: [
      { start: number, end: number, note: string, frequency: number }
    ]
  }
}
```

### Performance Model
```typescript
{
  id: string
  songId: string
  performanceData: [
    { timestamp: number, detectedFrequency: number, targetFrequency: number }
  ]
  feedback: {
    pitchAccuracy: number
    stability: number
    timing: number
    recommendations: string[]
  }
}
```

---

## 🧪 Probar la App

1. Abrir http://localhost:3000
2. Seleccionar una canción (ej: "Happy Birthday")
3. Permitir acceso al micrófono
4. Cantar y ver retroalimentación en tiempo real
5. Al terminar, ver el análisis completo

---

## 🔧 Comandos Útiles

### Backend
```powershell
npm run dev            # Desarrollo con nodemon
npm run build          # Compilar TypeScript
npm run prisma:studio  # UI de base de datos
```

### Frontend
```powershell
npm run dev            # Desarrollo
npm run build          # Build de producción
npm run lint           # Linter
```

---

## 📝 Notas Importantes

- **ml5.js**: Se usa vía CDN en el HTML (no npm) para evitar dependencias pesadas de TensorFlow
- **Puerto Backend**: 3001 (configurar CORS si cambias)
- **Puerto Frontend**: 3000
- **Base de Datos**: PostgreSQL requerido

---

## 🐛 Troubleshooting

**Error: Cannot find module '@prisma/client'**
```powershell
cd Backend
npm run prisma:generate
```

**Error: Port 3001 already in use**
```powershell
# Cambiar PORT en Backend/.env
PORT=3002
```

**Error: Microphone not detected**
- Verificar permisos del navegador
- Usar HTTPS o localhost
- Probar con Chrome/Edge

---

## 📄 Licencia

MIT - Proyecto Académico
