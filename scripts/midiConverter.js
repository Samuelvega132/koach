/**
 * 🎵 MIDI to JSON Converter
 * 
 * Convierte archivos MIDI a formato JSON para seed.ts
 * Usa Basic Pitch (Spotify) para generar el MIDI de audio
 * 
 * USO:
 * 1. Coloca tu archivo MIDI en la raíz como "input.mid"
 * 2. Ejecuta: node scripts/midiConverter.js
 * 3. Copia el JSON de la consola al seed.ts
 */

const fs = require('fs');
const path = require('path');
const { Midi } = require('@tonejs/midi');

// ============================================
// 🎹 HELPER: MIDI to Frequency
// ============================================
function midiToFrequency(midi) {
  return parseFloat((440 * Math.pow(2, (midi - 69) / 12)).toFixed(2));
}

// ============================================
// 🎹 HELPER: MIDI to Note Name
// ============================================
function midiToNoteName(midi) {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor((midi - 12) / 12);
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

// ============================================
// 🎵 MAIN CONVERTER
// ============================================
function convertMidiToJSON(midiFilePath) {
  console.log('🎵 MIDI to JSON Converter\n');
  console.log(`📂 Reading file: ${midiFilePath}`);

  // Leer el archivo MIDI
  const midiData = fs.readFileSync(midiFilePath);
  const midi = new Midi(midiData);

  console.log(`\n📊 MIDI Info:`);
  console.log(`   Name: ${midi.name || 'Untitled'}`);
  console.log(`   Duration: ${midi.duration.toFixed(2)}s`);
  console.log(`   Tracks: ${midi.tracks.length}`);
  console.log(`   PPQ (Ticks per Quarter): ${midi.header.ppq}`);
  console.log(`   Tempo: ${midi.header.tempos[0]?.bpm || 'Unknown'} BPM\n`);

  // ============================================
  // 🔍 STEP 1: Encontrar track principal (más notas)
  // ============================================
  let mainTrack = null;
  let maxNotes = 0;

  midi.tracks.forEach((track, index) => {
    console.log(`   Track ${index}: ${track.name || 'Unnamed'} (${track.notes.length} notes)`);
    if (track.notes.length > maxNotes) {
      maxNotes = track.notes.length;
      mainTrack = track;
    }
  });

  if (!mainTrack || mainTrack.notes.length === 0) {
    console.error('\n❌ ERROR: No se encontraron notas en el MIDI');
    process.exit(1);
  }

  console.log(`\n✅ Track principal seleccionado: ${mainTrack.name || 'Unnamed'} (${mainTrack.notes.length} notas)`);

  // ============================================
  // 🔍 STEP 2: Filtrar y convertir notas
  // ============================================
  const MIN_DURATION = 0.15; // Filtro de ruido (segundos)
  const notes = [];

  mainTrack.notes.forEach((note) => {
    const duration = note.duration;

    // Filtrar notas muy cortas (ruido)
    if (duration < MIN_DURATION) {
      return;
    }

    // Convertir a formato del seed
    const convertedNote = {
      time: parseFloat(note.time.toFixed(2)),
      duration: parseFloat(duration.toFixed(2)),
      midi: note.midi,
      note: midiToNoteName(note.midi),
      frequency: midiToFrequency(note.midi),
      lyric: "" // Para llenar manualmente
    };

    notes.push(convertedNote);
  });

  console.log(`\n🔬 Procesamiento:`);
  console.log(`   Notas originales: ${mainTrack.notes.length}`);
  console.log(`   Notas filtradas (< ${MIN_DURATION}s): ${mainTrack.notes.length - notes.length}`);
  console.log(`   Notas finales: ${notes.length}`);

  // ============================================
  // 📊 STEP 3: Análisis estadístico
  // ============================================
  const midiValues = notes.map(n => n.midi);
  const minMidi = Math.min(...midiValues);
  const maxMidi = Math.max(...midiValues);
  const avgMidi = Math.round(midiValues.reduce((a, b) => a + b, 0) / midiValues.length);

  console.log(`\n📈 Análisis de Rango:`);
  console.log(`   Nota más grave: ${midiToNoteName(minMidi)} (MIDI ${minMidi})`);
  console.log(`   Nota más aguda: ${midiToNoteName(maxMidi)} (MIDI ${maxMidi})`);
  console.log(`   Nota promedio: ${midiToNoteName(avgMidi)} (MIDI ${avgMidi})`);
  console.log(`   Rango total: ${maxMidi - minMidi} semitonos\n`);

  // ============================================
  // 📤 STEP 4: Output JSON
  // ============================================
  console.log('═══════════════════════════════════════');
  console.log('📋 JSON OUTPUT (Copy to seed.ts)');
  console.log('═══════════════════════════════════════\n');
  console.log('melodyData: {');
  console.log('  notes: [');
  
  notes.forEach((note, index) => {
    const isLast = index === notes.length - 1;
    const json = JSON.stringify(note);
    console.log(`    ${json}${isLast ? '' : ','}`);
  });
  
  console.log('  ]');
  console.log('}');
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Conversión completada!');
  console.log('═══════════════════════════════════════\n');

  // ============================================
  // 💡 TIPS
  // ============================================
  console.log('💡 NEXT STEPS:');
  console.log('   1. Copia el JSON de arriba');
  console.log('   2. Pégalo en tu seed.ts reemplazando melodyData');
  console.log('   3. Llena los campos "lyric" manualmente con las sílabas');
  console.log('   4. Ajusta los valores de time si hay desfase con el audio');
  console.log('   5. Ejecuta: npx prisma db seed\n');

  // ============================================
  // 📊 Estadísticas finales
  // ============================================
  const totalDuration = notes[notes.length - 1].time + notes[notes.length - 1].duration;
  console.log('📊 STATS:');
  console.log(`   Total notas: ${notes.length}`);
  console.log(`   Duración total: ${totalDuration.toFixed(2)}s`);
  console.log(`   Densidad: ${(notes.length / totalDuration).toFixed(2)} notas/segundo`);
}

// ============================================
// 🚀 EXECUTION
// ============================================
const inputFile = path.join(__dirname, '..', 'input.mid');

if (!fs.existsSync(inputFile)) {
  console.error('❌ ERROR: No se encontró el archivo "input.mid" en la raíz del proyecto');
  console.log('\n💡 Pasos para usar este script:');
  console.log('   1. Genera un MIDI con Basic Pitch (https://basicpitch.spotify.com/)');
  console.log('   2. Guarda el archivo como "input.mid" en la raíz del proyecto');
  console.log('   3. Ejecuta: node scripts/midiConverter.js\n');
  process.exit(1);
}

try {
  convertMidiToJSON(inputFile);
} catch (error) {
  console.error('\n❌ ERROR al procesar el MIDI:');
  console.error(error.message);
  console.error('\n💡 Verifica que:');
  console.error('   - El archivo sea un MIDI válido');
  console.error('   - Tenga al menos un track con notas');
  console.error('   - No esté corrupto\n');
  process.exit(1);
}
