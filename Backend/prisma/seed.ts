/**
 * ============================================
 * SEED DATA - Datos Mejorados con Supabase Storage
 * ============================================
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const prisma = new PrismaClient();

// ============================================
// CONSTANTES DE ARCHIVOS EN STORAGE
// ============================================
// Asegúrate de que estos nombres coincidan con lo que subiste a Supabase
const STORAGE_FILES = {
  HAPPY_BIRTHDAY: 'happy-birthday.mp3',
  TWINKLE: 'twinkle-twinkle.mp3',
  DO_RE_MI: 'do-re-mi-scale.mp3',
  COLOR_ESPERANZA: 'color-esperanza.mp3', // 👈 ¡Asegúrate que se llame así en tu Bucket!
} as const;

// Generar URLs públicas de Supabase Storage
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const BUCKET_NAME = 'songs';

function getStorageUrl(filename: string): string {
  // Nota: Si usas un Custom Domain o diferente estructura, ajusta esto.
  // Por defecto Supabase es: https://[PROYECTO].supabase.co/storage/v1/object/public/[BUCKET]/[ARCHIVO]
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
}

const AUDIO_URLS = {
  HAPPY_BIRTHDAY: getStorageUrl(STORAGE_FILES.HAPPY_BIRTHDAY),
  TWINKLE: getStorageUrl(STORAGE_FILES.TWINKLE),
  DO_RE_MI: getStorageUrl(STORAGE_FILES.DO_RE_MI),
  COLOR_ESPERANZA: getStorageUrl(STORAGE_FILES.COLOR_ESPERANZA),
};

async function main() {
  console.log('🌱 Seeding database with Supabase Storage URLs...');
  console.log('📦 Storage URL Base:', SUPABASE_URL);
  console.log('');

  // Limpiar datos existentes
  console.log('🗑️  Cleaning existing data...');
  try {
    await prisma.performanceLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.song.deleteMany();
    console.log('✅ Data cleaned');
  } catch (error) {
    console.warn('⚠️  Could not clean all data (maybe tables are empty). Continuing...');
  }
  console.log('');

  // ============================================
  // CANCIÓN 1: Happy Birthday
  // ============================================
  console.log('📝 Creating: Happy Birthday');
  await prisma.song.create({
    data: {
      title: 'Happy Birthday',
      artist: 'Traditional',
      bpm: 120,
      key: 'C',
      audioUrl: AUDIO_URLS.HAPPY_BIRTHDAY,
      melodyData: {
        notes: [
          { start: 0.5, end: 1.5, note: 'C4', frequency: 261.63 },
          { start: 1.5, end: 2.5, note: 'C4', frequency: 261.63 },
          { start: 2.5, end: 3.5, note: 'D4', frequency: 293.66 },
          { start: 3.5, end: 5.0, note: 'C4', frequency: 261.63 },
          { start: 5.0, end: 6.5, note: 'F4', frequency: 349.23 },
          { start: 6.5, end: 8.5, note: 'E4', frequency: 329.63 },
        ],
      },
    },
  });

  // ============================================
  // CANCIÓN 2: Twinkle Twinkle Little Star
  // ============================================
  console.log('📝 Creating: Twinkle Twinkle');
  await prisma.song.create({
    data: {
      title: 'Twinkle Twinkle Little Star',
      artist: 'Traditional',
      bpm: 100,
      key: 'C',
      audioUrl: AUDIO_URLS.TWINKLE,
      melodyData: {
        notes: [
          { start: 0.0, end: 1.0, note: 'C4', frequency: 261.63 },
          { start: 1.0, end: 2.0, note: 'C4', frequency: 261.63 },
          { start: 2.0, end: 3.0, note: 'G4', frequency: 392.0 },
          { start: 3.0, end: 4.0, note: 'G4', frequency: 392.0 },
        ],
      },
    },
  });

  // ============================================
  // CANCIÓN 3: Do-Re-Mi (Escala)
  // ============================================
  console.log('📝 Creating: Do-Re-Mi Scale');
  await prisma.song.create({
    data: {
      title: 'Do-Re-Mi Scale',
      artist: 'Practice',
      bpm: 60,
      key: 'C',
      audioUrl: AUDIO_URLS.DO_RE_MI,
      melodyData: {
        notes: [
          { start: 0.0, end: 1.0, note: 'C4', frequency: 261.63 },
          { start: 1.0, end: 2.0, note: 'D4', frequency: 293.66 },
          { start: 2.0, end: 3.0, note: 'E4', frequency: 329.63 },
          { start: 3.0, end: 4.0, note: 'F4', frequency: 349.23 },
          { start: 4.0, end: 5.0, note: 'G4', frequency: 392.0 },
        ],
      },
    },
  });

  // ============================================
  // CANCIÓN 4: COLOR ESPERANZA (LA IMPORTANTE)
  // ============================================
  console.log('📝 Creating: Color Esperanza');
  const colorEsperanza = await prisma.song.create({
    data: {
      title: 'Color Esperanza',
      artist: 'Diego Torres',
      bpm: 128,
      key: 'F', // Fa Mayor
      audioUrl: AUDIO_URLS.COLOR_ESPERANZA,
      // Usamos la estructura nueva (time/duration/lyric) para el Piano Roll
      melodyData: {
        notes: [
          // --- VERSO 1 (Inicio exacto: 0:04) ---
          { "time": 4.0, "duration": 0.4, "midi": 69, "note": "A4", "lyric": "Sé" },
          { "time": 4.6, "duration": 0.2, "midi": 67, "note": "G4", "lyric": "que" },
          { "time": 4.8, "duration": 0.2, "midi": 65, "note": "F4", "lyric": "hay" },
          { "time": 5.0, "duration": 0.2, "midi": 67, "note": "G4", "lyric": "en" },
          { "time": 5.2, "duration": 0.2, "midi": 69, "note": "A4", "lyric": "tus" },
          { "time": 5.4, "duration": 0.4, "midi": 67, "note": "G4", "lyric": "o" },
          { "time": 5.8, "duration": 0.8, "midi": 67, "note": "G4", "lyric": "jos" },

          { "time": 7.0, "duration": 0.3, "midi": 65, "note": "F4", "lyric": "con" },
          { "time": 7.3, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "so" },
          { "time": 7.6, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "lo" },
          { "time": 7.9, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "mi" },
          { "time": 8.2, "duration": 0.8, "midi": 65, "note": "F4", "lyric": "rar" },

          // "Que estás cansado..."
          { "time": 11.5, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "Que" },
          { "time": 11.8, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "es" },
          { "time": 12.1, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "tás" },
          { "time": 12.4, "duration": 0.3, "midi": 65, "note": "F4", "lyric": "can" },
          { "time": 12.7, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "sa" },
          { "time": 13.0, "duration": 0.6, "midi": 69, "note": "A4", "lyric": "do" },

          { "time": 14.2, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "de an" },
          { "time": 14.5, "duration": 0.3, "midi": 65, "note": "F4", "lyric": "dar" },
          { "time": 14.8, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "y" },
          { "time": 15.1, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "de an" },
          { "time": 15.4, "duration": 0.8, "midi": 67, "note": "G4", "lyric": "dar" },

          // "Y caminar..."
          { "time": 18.5, "duration": 0.3, "midi": 65, "note": "F4", "lyric": "Y" },
          { "time": 18.8, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "ca" },
          { "time": 19.1, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "mi" },
          { "time": 19.4, "duration": 0.6, "midi": 70, "note": "Bb4", "lyric": "nar" },

          { "time": 20.5, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "gi" },
          { "time": 20.8, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "ran" },
          { "time": 21.1, "duration": 0.3, "midi": 65, "note": "F4", "lyric": "do" },
          { "time": 21.4, "duration": 0.3, "midi": 64, "note": "E4", "lyric": "siem" },
          { "time": 21.7, "duration": 0.3, "midi": 65, "note": "F4", "lyric": "pre" },
          { "time": 22.0, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "en" },
          { "time": 22.3, "duration": 0.3, "midi": 65, "note": "F4", "lyric": "un" },
          { "time": 22.6, "duration": 0.8, "midi": 65, "note": "F4", "lyric": "lu" },
          { "time": 23.0, "duration": 0.8, "midi": 65, "note": "F4", "lyric": "gar" },

          // --- PRE-CORO ---
          { "time": 26.5, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "Sé" },
          { "time": 26.8, "duration": 0.3, "midi": 70, "note": "Bb4", "lyric": "que" },
          { "time": 27.1, "duration": 0.3, "midi": 72, "note": "C5", "lyric": "las" },
          { "time": 27.4, "duration": 0.3, "midi": 72, "note": "C5", "lyric": "ven" },
          { "time": 27.7, "duration": 0.3, "midi": 70, "note": "Bb4", "lyric": "ta" },
          { "time": 28.0, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "nas" },
          { "time": 28.3, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "se" },
          { "time": 28.6, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "pue" },
          { "time": 28.9, "duration": 0.3, "midi": 70, "note": "Bb4", "lyric": "den" },
          { "time": 29.2, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "a" },
          { "time": 29.5, "duration": 0.6, "midi": 67, "note": "G4", "lyric": "brir" },

          { "time": 30.5, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "Cam" },
          { "time": 30.8, "duration": 0.3, "midi": 70, "note": "Bb4", "lyric": "biar" },
          { "time": 31.1, "duration": 0.3, "midi": 72, "note": "C5", "lyric": "el" },
          { "time": 31.4, "duration": 0.3, "midi": 72, "note": "C5", "lyric": "ai" },
          { "time": 31.7, "duration": 0.3, "midi": 70, "note": "Bb4", "lyric": "re" },
          { "time": 32.0, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "de" },
          { "time": 32.3, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "pen" },
          { "time": 32.6, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "de" },
          { "time": 32.9, "duration": 0.3, "midi": 70, "note": "Bb4", "lyric": "de" },
          { "time": 33.2, "duration": 0.8, "midi": 69, "note": "A4", "lyric": "ti" },

          { "time": 34.5, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "Te a" },
          { "time": 34.8, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "yu" },
          { "time": 35.1, "duration": 0.3, "midi": 65, "note": "F4", "lyric": "da" },
          { "time": 35.4, "duration": 0.8, "midi": 65, "note": "F4", "lyric": "rá" },

          { "time": 36.5, "duration": 0.3, "midi": 69, "note": "A4", "lyric": "Va" },
          { "time": 36.8, "duration": 0.3, "midi": 67, "note": "G4", "lyric": "le" },
          { "time": 37.1, "duration": 0.3, "midi": 65, "note": "F4", "lyric": "la" },
          { "time": 37.4, "duration": 0.3, "midi": 65, "note": "F4", "lyric": "pe" },
          { "time": 37.7, "duration": 0.6, "midi": 65, "note": "F4", "lyric": "na" },

          { "time": 38.5, "duration": 0.3, "midi": 64, "note": "E4", "lyric": "u" },
          { "time": 38.8, "duration": 0.3, "midi": 62, "note": "D4", "lyric": "na" },
          { "time": 39.1, "duration": 0.3, "midi": 60, "note": "C4", "lyric": "vez" },
          { "time": 39.4, "duration": 0.8, "midi": 60, "note": "C4", "lyric": "más" },

          // --- CORO ---
          { "time": 40.5, "duration": 0.4, "midi": 65, "note": "F4", "lyric": "Sa" },
          { "time": 40.9, "duration": 0.4, "midi": 65, "note": "F4", "lyric": "ber" },
          { "time": 41.3, "duration": 0.4, "midi": 67, "note": "G4", "lyric": "que" },
          { "time": 41.7, "duration": 0.4, "midi": 69, "note": "A4", "lyric": "se" },
          { "time": 42.1, "duration": 0.6, "midi": 70, "note": "Bb4", "lyric": "pue" },
          { "time": 42.7, "duration": 0.8, "midi": 69, "note": "A4", "lyric": "de" },

          { "time": 44.0, "duration": 0.4, "midi": 65, "note": "F4", "lyric": "Que" },
          { "time": 44.4, "duration": 0.4, "midi": 65, "note": "F4", "lyric": "rer" },
          { "time": 44.8, "duration": 0.4, "midi": 67, "note": "G4", "lyric": "que" },
          { "time": 45.2, "duration": 0.4, "midi": 69, "note": "A4", "lyric": "se" },
          { "time": 45.6, "duration": 0.6, "midi": 70, "note": "Bb4", "lyric": "pue" },
          { "time": 46.2, "duration": 0.8, "midi": 69, "note": "A4", "lyric": "da" },

          { "time": 47.5, "duration": 0.4, "midi": 65, "note": "F4", "lyric": "Qui" },
          { "time": 47.9, "duration": 0.4, "midi": 67, "note": "G4", "lyric": "tar" },
          { "time": 48.3, "duration": 0.4, "midi": 69, "note": "A4", "lyric": "se" },
          { "time": 48.7, "duration": 0.4, "midi": 70, "note": "Bb4", "lyric": "los" },
          { "time": 49.1, "duration": 0.6, "midi": 72, "note": "C5", "lyric": "mie" },
          { "time": 49.7, "duration": 0.8, "midi": 70, "note": "Bb4", "lyric": "dos" },

          { "time": 51.0, "duration": 0.4, "midi": 69, "note": "A4", "lyric": "Sa" },
          { "time": 51.4, "duration": 0.4, "midi": 70, "note": "Bb4", "lyric": "car" },
          { "time": 51.8, "duration": 0.4, "midi": 72, "note": "C5", "lyric": "los" },
          { "time": 52.2, "duration": 0.4, "midi": 70, "note": "Bb4", "lyric": "a" },
          { "time": 52.6, "duration": 0.6, "midi": 69, "note": "A4", "lyric": "fue" },
          { "time": 53.2, "duration": 0.8, "midi": 67, "note": "G4", "lyric": "ra" }
        ]
      },
    },
  });
  console.log('✅ Created:', colorEsperanza.title);
  console.log('   URL:', colorEsperanza.audioUrl);
  console.log('');

  console.log('═══════════════════════════════════════');
  console.log('✅ Seed completed successfully!');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Songs created: 4`);
  console.log(`   - Storage bucket: ${BUCKET_NAME}`);
  console.log('');
  console.log('⚠️  IMPORTANT: Make sure "color-esperanza.mp3" exists in your Supabase bucket!');
}

main()
  .catch((e) => {
    console.error('');
    console.error('═══════════════════════════════════════');
    console.error('❌ Error seeding database');
    console.error('═══════════════════════════════════════');
    console.error(e);
    console.error('');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });