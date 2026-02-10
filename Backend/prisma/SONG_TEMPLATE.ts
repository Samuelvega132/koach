/**
 * 🎵 TEMPLATE PARA NUEVAS CANCIONES
 * 
 * Usa este template para agregar nuevas canciones al seed.
 * FORMATO OBLIGATORIO: time/duration/midi/note/frequency/lyric
 */

import { PrismaClient } from '@prisma/client';

// Helper para calcular frecuencia desde MIDI
function midiToFrequency(midi: number): number {
  return parseFloat((440 * Math.pow(2, (midi - 69) / 12)).toFixed(2));
}

// ============================================
// 📋 TEMPLATE DE CANCIÓN
// ============================================

export const NUEVA_CANCION_TEMPLATE = {
  title: 'Nombre de la Canción',
  artist: 'Artista',
  bpm: 120,                    // Tempo de la canción
  key: 'C',                    // Tonalidad (C, Am, F#, etc)
  audioUrl: 'https://gmykhosxtzybujorbjvt.supabase.co/storage/v1/object/public/songs/tu-cancion.mp3',
  melodyData: {
    notes: [
      // ✅ FORMATO OBLIGATORIO
      {
        "time": 0.0,                           // ⏱️ Inicio en segundos
        "duration": 0.5,                       // ⏱️ Duración en segundos
        "midi": 60,                            // 🎹 MIDI (60=C4, 69=A4, 72=C5)
        "note": "C4",                          // 🎵 Nombre de nota
        "frequency": midiToFrequency(60),      // 📊 Hz (auto-calculado)
        "lyric": "Can"                         // 📝 Sílaba/letra (opcional)
      },
      {
        "time": 0.5,
        "duration": 0.5,
        "midi": 62,
        "note": "D4",
        "frequency": midiToFrequency(62),
        "lyric": "ta"
      },
      {
        "time": 1.0,
        "duration": 0.8,
        "midi": 64,
        "note": "E4",
        "frequency": midiToFrequency(64),
        "lyric": "con"
      },
      // ... más notas
    ]
  }
};

// ============================================
// 📊 REFERENCIA RÁPIDA: MIDI TO NOTE
// ============================================
/*
OCTAVA 3 (Grave)
48: C3  (130.81 Hz)
49: C#3 (138.59 Hz)
50: D3  (146.83 Hz)
51: D#3 (155.56 Hz)
52: E3  (164.81 Hz)
53: F3  (174.61 Hz)
54: F#3 (185.00 Hz)
55: G3  (196.00 Hz)
56: G#3 (207.65 Hz)
57: A3  (220.00 Hz)
58: A#3 (233.08 Hz)
59: B3  (246.94 Hz)

OCTAVA 4 (Media - Más Común)
60: C4  (261.63 Hz) - Do central
61: C#4 (277.18 Hz)
62: D4  (293.66 Hz)
63: D#4 (311.13 Hz)
64: E4  (329.63 Hz)
65: F4  (349.23 Hz)
66: F#4 (369.99 Hz)
67: G4  (392.00 Hz)
68: G#4 (415.30 Hz)
69: A4  (440.00 Hz) ⭐ REFERENCIA ESTÁNDAR
70: A#4 (466.16 Hz) - Bb4
71: B4  (493.88 Hz)

OCTAVA 5 (Agudo)
72: C5  (523.25 Hz)
73: C#5 (554.37 Hz)
74: D5  (587.33 Hz)
75: D#5 (622.25 Hz)
76: E5  (659.25 Hz)
77: F5  (698.46 Hz)
78: F#5 (739.99 Hz)
79: G5  (783.99 Hz)
80: G#5 (830.61 Hz)
81: A5  (880.00 Hz)
*/

// ============================================
// 🛠️ EJEMPLO DE USO EN seed.ts
// ============================================
/*
await prisma.song.create({
  data: {
    title: 'Despacito',
    artist: 'Luis Fonsi',
    bpm: 89,
    key: 'Bm',
    audioUrl: getStorageUrl('despacito.mp3'),
    melodyData: {
      notes: [
        { time: 0.0, duration: 0.4, midi: 71, note: "B4", frequency: midiToFrequency(71), lyric: "Des" },
        { time: 0.4, duration: 0.3, midi: 69, note: "A4", frequency: midiToFrequency(69), lyric: "pa" },
        { time: 0.7, duration: 0.3, midi: 67, note: "G4", frequency: midiToFrequency(67), lyric: "ci" },
        { time: 1.0, duration: 0.6, midi: 66, note: "F#4", frequency: midiToFrequency(66), lyric: "to" },
        // ... resto de notas
      ]
    }
  }
});
*/

// ============================================
// 📝 CHECKLIST ANTES DE AGREGAR CANCIÓN
// ============================================
/*
✅ Audio subido a Supabase Storage (bucket: songs)
✅ Todas las notas tienen time, duration, midi, note, frequency
✅ frequency calculada con midiToFrequency(midi)
✅ midi coincide con note (ej: midi 69 = "A4")
✅ time en orden ascendente
✅ duration > 0
✅ lyric opcional pero recomendado
✅ BPM correcto (medido con metrónomo o DAW)
✅ Key correcta (analizada con software de música)
*/

// ============================================
// ⚠️ ERRORES COMUNES
// ============================================
/*
❌ Usar start/end en lugar de time/duration
❌ Olvidar el campo frequency
❌ midi no coincide con note (ej: midi 60 pero note "D4")
❌ frequency incorrecta (copiar de tabla en lugar de calcular)
❌ time sin orden (ej: time 2.0 antes de time 1.5)
❌ audioUrl no público o incorrecto
❌ Mezclar formato simple con avanzado
*/
