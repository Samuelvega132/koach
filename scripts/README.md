# 🎵 MIDI to JSON Converter

Script para convertir archivos MIDI a formato JSON compatible con el seed de Koach.

## 🔧 Instalación

```bash
npm install @tonejs/midi
```

## 📋 Workflow Completo

### 1️⃣ Generar MIDI desde Audio

Usa **Basic Pitch** de Spotify para convertir audio a MIDI:

🔗 https://basicpitch.spotify.com/

**Pasos:**
1. Abre el sitio web
2. Sube tu archivo MP3/WAV
3. Descarga el archivo `.mid` generado
4. Renómbralo como `input.mid`
5. Colócalo en la **raíz** del proyecto (mismo nivel que `package.json`)

### 2️⃣ Ejecutar el Converter

```bash
node scripts/midiConverter.js
```

### 3️⃣ Copiar el Output

El script imprimirá en consola:

```javascript
melodyData: {
  notes: [
    {"time":0.5,"duration":0.4,"midi":69,"note":"A4","frequency":440,"lyric":""},
    {"time":0.9,"duration":0.3,"midi":67,"note":"G4","frequency":392,"lyric":""},
    // ... más notas
  ]
}
```

### 4️⃣ Integrar en seed.ts

```typescript
await prisma.song.create({
  data: {
    title: 'Mi Canción',
    artist: 'Artista',
    bpm: 120,
    key: 'C',
    audioUrl: getStorageUrl('mi-cancion.mp3'),
    melodyData: {
      notes: [
        // 👈 PEGA AQUÍ EL JSON DEL CONVERTER
      ]
    }
  }
});
```

### 5️⃣ Agregar Letras Manualmente

Edita los campos `"lyric": ""` con las sílabas correspondientes:

```javascript
{"time":0.5,"duration":0.4,"midi":69,"note":"A4","frequency":440,"lyric":"Can"},
{"time":0.9,"duration":0.3,"midi":67,"note":"G4","frequency":392,"lyric":"ta"},
```

## ⚙️ Configuración

### Filtro de Ruido

El script ignora notas menores a **0.15 segundos** por defecto.

Para cambiar el umbral, edita en `midiConverter.js`:

```javascript
const MIN_DURATION = 0.15; // Cambiar aquí
```

### Selección de Track

El script selecciona automáticamente el track con **más notas**.

Si necesitas elegir manualmente, modifica:

```javascript
// Forzar track específico (índice 0, 1, 2, etc)
mainTrack = midi.tracks[1]; // Track 1
```

## 📊 Output del Script

El script proporciona:

✅ **Análisis del MIDI:**
- Duración total
- Número de tracks
- Tempo (BPM)

✅ **Estadísticas de Notas:**
- Notas originales
- Notas filtradas (ruido)
- Nota más grave/aguda
- Rango total

✅ **JSON Formateado:**
- Listo para copiar al seed
- Valores de frequency auto-calculados
- Campos time/duration/midi/note/frequency/lyric

## 🐛 Troubleshooting

### Error: "No se encontró el archivo 'input.mid'"
- Verifica que `input.mid` esté en la **raíz** del proyecto
- Asegúrate que el nombre sea exactamente `input.mid` (minúsculas)

### Error: "No se encontraron notas en el MIDI"
- El MIDI está vacío o corrupto
- Regenera el MIDI con Basic Pitch
- Verifica que el audio tenga voz/melodía clara

### Notas muy cortas (< 0.15s) filtradas
- Aumenta `MIN_DURATION` si pierdes notas válidas
- Disminuye si quieres capturar notas muy rápidas

### Desfase entre MIDI y Audio
- Basic Pitch puede tener ligero offset
- Ajusta manualmente los valores de `time` sumando/restando un offset fijo

**Ejemplo:**
```javascript
// Si todas las notas están 0.2s adelantadas
notes.forEach(n => n.time += 0.2);
```

## 💡 Tips

### Mejora la Precisión del MIDI
- Usa audio de alta calidad (WAV > MP3)
- Vocals aislados funcionan mejor (sin instrumental)
- Grabaciones studio > grabaciones en vivo

### Workflow Recomendado
1. Extrae vocals con software (Spleeter, RipX, etc)
2. Genera MIDI con Basic Pitch
3. Convierte con este script
4. Ajusta letras y timing manualmente

### Para Canciones Largas
- Divide la canción en secciones (verso, coro, puente)
- Convierte cada sección por separado
- Une los arrays manualmente ajustando `time`

## 📚 Recursos

- **Basic Pitch**: https://basicpitch.spotify.com/
- **@tonejs/midi**: https://github.com/Tonejs/Midi
- **MIDI Note Reference**: https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies

## 🎯 Ejemplo Completo

```bash
# 1. Instalar dependencia
npm install @tonejs/midi

# 2. Colocar input.mid en raíz

# 3. Ejecutar
node scripts/midiConverter.js

# 4. Copiar output a seed.ts

# 5. Llenar letras manualmente

# 6. Ejecutar seed
cd Backend
npx prisma db seed
```

---

**Creado para:** Koach - Sistema de Karaoke Inteligente  
**Versión:** 1.0.0  
**Última actualización:** 2026-02-03
