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
// HELPER: Calcular frecuencia desde MIDI
// ============================================
/**
 * Convierte un valor MIDI a frecuencia en Hz
 * Fórmula: f = 440 * 2^((midi - 69) / 12)
 * Donde MIDI 69 = A4 = 440 Hz (referencia estándar)
 */
function midiToFrequency(midi: number): number {
  return parseFloat((440 * Math.pow(2, (midi - 69) / 12)).toFixed(2));
}

// ============================================
// CONSTANTES DE ARCHIVOS EN STORAGE
// ============================================
const STORAGE_FILES = {
  COLOR_ESPERANZA: 'color-esperanza.mp3',
  LA_BACHATA: 'la-bachata.mp3',
} as const;

// Generar URLs públicas de Supabase Storage
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const BUCKET_NAME = 'songs';

function getStorageUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
}

const AUDIO_URLS = {
  COLOR_ESPERANZA: getStorageUrl(STORAGE_FILES.COLOR_ESPERANZA),
  LA_BACHATA: getStorageUrl(STORAGE_FILES.LA_BACHATA), // Intentional duplicate for testing
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

  console.log('📝 Creating: La Bachata');
  const laBachata = await prisma.song.create({
    data: {
      title: 'La Bachata',
      artist: 'Manuel Turizo',
      bpm: 125,
      key: 'Gm', // Sol menor
      audioUrl: AUDIO_URLS.LA_BACHATA,
    melodyData: {
      notes: [
    {"time":0.97,"duration":0.15,"midi":34,"note":"A#1","frequency":58.27,"lyric":""},
    {"time":1.71,"duration":0.15,"midi":34,"note":"A#1","frequency":58.27,"lyric":""},
    {"time":5.68,"duration":0.34,"midi":34,"note":"A#1","frequency":58.27,"lyric":""},
    {"time":8.91,"duration":0.2,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":9.33,"duration":0.2,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":9.59,"duration":0.36,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":9.97,"duration":0.24,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":10.3,"duration":0.23,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":10.51,"duration":0.24,"midi":53,"note":"F3","frequency":174.61,"lyric":""},
    {"time":10.76,"duration":0.23,"midi":53,"note":"F3","frequency":174.61,"lyric":""},
    {"time":10.99,"duration":0.27,"midi":53,"note":"F3","frequency":174.61,"lyric":""},
    {"time":11.26,"duration":0.21,"midi":53,"note":"F3","frequency":174.61,"lyric":""},
    {"time":11.47,"duration":0.27,"midi":53,"note":"F3","frequency":174.61,"lyric":""},
    {"time":11.73,"duration":0.23,"midi":53,"note":"F3","frequency":174.61,"lyric":""},
    {"time":11.97,"duration":0.55,"midi":53,"note":"F3","frequency":174.61,"lyric":""},
    {"time":12.51,"duration":0.57,"midi":53,"note":"F3","frequency":174.61,"lyric":""},
    {"time":13.21,"duration":0.16,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":13.65,"duration":0.28,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":13.93,"duration":0.17,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":14.15,"duration":0.3,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":15.45,"duration":0.15,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":15.6,"duration":0.24,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":15.81,"duration":0.23,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":16.04,"duration":0.46,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":16.51,"duration":0.49,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":17.04,"duration":0.2,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":17.26,"duration":0.24,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":17.51,"duration":0.16,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":17.67,"duration":0.24,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":18.67,"duration":0.15,"midi":56,"note":"G#3","frequency":207.65,"lyric":""},
    {"time":18.91,"duration":0.17,"midi":56,"note":"G#3","frequency":207.65,"lyric":""},
    {"time":19.16,"duration":0.2,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":19.46,"duration":0.15,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":19.67,"duration":0.16,"midi":56,"note":"G#3","frequency":207.65,"lyric":""},
    {"time":19.9,"duration":0.22,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":20.12,"duration":0.24,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":20.37,"duration":0.23,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":20.6,"duration":0.21,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":20.85,"duration":0.19,"midi":59,"note":"B3","frequency":246.94,"lyric":""},
    {"time":21.09,"duration":0.27,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":21.4,"duration":0.15,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":21.55,"duration":0.22,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":21.79,"duration":0.31,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":22.75,"duration":0.17,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":23.06,"duration":0.27,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":23.33,"duration":0.17,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":23.59,"duration":0.28,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":23.87,"duration":0.16,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":24.06,"duration":0.34,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":24.71,"duration":0.22,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":24.93,"duration":0.24,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":25.17,"duration":0.17,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":25.43,"duration":0.15,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":25.58,"duration":0.16,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":26.05,"duration":0.22,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":26.6,"duration":0.15,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":26.8,"duration":0.21,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":27.06,"duration":0.2,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":27.32,"duration":0.19,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":27.54,"duration":0.21,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":27.75,"duration":0.23,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":28.02,"duration":0.17,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":28.2,"duration":0.3,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":28.5,"duration":0.17,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":28.67,"duration":0.34,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":29.16,"duration":0.51,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":30.48,"duration":0.16,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":30.79,"duration":0.17,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":30.96,"duration":0.19,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":31.23,"duration":0.36,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":31.59,"duration":0.16,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":31.73,"duration":0.36,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":32.31,"duration":0.17,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":33.11,"duration":0.39,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":33.6,"duration":0.35,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":34.34,"duration":0.2,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":34.54,"duration":0.17,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":34.77,"duration":0.15,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":35,"duration":0.23,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":35.23,"duration":0.22,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":35.48,"duration":0.21,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":35.69,"duration":0.21,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":36.03,"duration":0.15,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":36.2,"duration":0.2,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":36.46,"duration":0.19,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":36.75,"duration":0.15,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":36.95,"duration":0.37,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":37.38,"duration":0.23,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":37.7,"duration":0.18,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":37.9,"duration":0.21,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":38.12,"duration":0.27,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":38.6,"duration":0.16,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":38.86,"duration":0.17,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":39.09,"duration":0.29,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":39.38,"duration":0.42,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":39.8,"duration":0.21,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":40.01,"duration":0.28,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":40.27,"duration":0.15,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":40.51,"duration":0.23,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":41.53,"duration":0.19,"midi":64,"note":"E4","frequency":329.63,"lyric":""},
    {"time":41.72,"duration":0.23,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":41.95,"duration":0.15,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":42.1,"duration":0.15,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":42.45,"duration":0.2,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":42.71,"duration":0.2,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":42.94,"duration":0.22,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":43.16,"duration":0.2,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":43.36,"duration":0.24,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":43.6,"duration":0.31,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":43.91,"duration":0.16,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":44.39,"duration":0.3,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":45.43,"duration":0.15,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":45.59,"duration":0.48,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":46.06,"duration":0.21,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":46.27,"duration":0.31,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":47.21,"duration":0.24,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":47.46,"duration":0.24,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":47.7,"duration":0.21,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":48.19,"duration":0.2,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":48.39,"duration":0.21,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":48.63,"duration":0.29,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":48.93,"duration":0.3,"midi":56,"note":"G#3","frequency":207.65,"lyric":""},
    {"time":50.09,"duration":0.16,"midi":55,"note":"G3","frequency":196,"lyric":""},
    {"time":50.38,"duration":0.19,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":50.57,"duration":0.21,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":50.83,"duration":0.21,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":51.03,"duration":0.26,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":51.29,"duration":0.24,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":51.53,"duration":0.26,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":51.79,"duration":0.42,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":52.21,"duration":0.22,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":52.52,"duration":0.22,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":52.74,"duration":0.21,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":53.02,"duration":0.2,"midi":66,"note":"F#4","frequency":369.99,"lyric":""},
    {"time":53.47,"duration":0.23,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":53.74,"duration":0.16,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":53.94,"duration":0.16,"midi":59,"note":"B3","frequency":246.94,"lyric":""},
    {"time":54.23,"duration":0.19,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":54.42,"duration":0.27,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":54.68,"duration":0.49,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":55.17,"duration":0.2,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":55.37,"duration":0.23,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":55.97,"duration":0.3,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":56.89,"duration":0.17,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":57.06,"duration":0.2,"midi":64,"note":"E4","frequency":329.63,"lyric":""},
    {"time":57.3,"duration":0.29,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":57.83,"duration":0.16,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":58.1,"duration":0.19,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":58.52,"duration":0.31,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":58.83,"duration":0.15,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":58.98,"duration":0.48,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":59.42,"duration":0.15,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":59.69,"duration":0.37,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":60.91,"duration":0.53,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":61.58,"duration":0.27,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":61.99,"duration":0.15,"midi":67,"note":"G4","frequency":392,"lyric":""},
    {"time":62.41,"duration":0.19,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":62.59,"duration":0.26,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":62.85,"duration":0.41,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":63.29,"duration":0.17,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":63.61,"duration":0.17,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":63.78,"duration":0.21,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":64.04,"duration":0.23,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":64.27,"duration":0.17,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":64.44,"duration":0.19,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":65.46,"duration":0.15,"midi":54,"note":"F#3","frequency":185,"lyric":""},
    {"time":65.79,"duration":0.15,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":65.94,"duration":0.27,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":66.21,"duration":0.2,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":66.41,"duration":0.23,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":66.64,"duration":0.16,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":67.09,"duration":0.19,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":67.41,"duration":0.19,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":67.6,"duration":0.21,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":67.81,"duration":0.15,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":67.96,"duration":0.39,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":68.33,"duration":0.15,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":68.48,"duration":0.16,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":68.65,"duration":0.3,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":69.67,"duration":0.2,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":69.87,"duration":0.34,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":70.2,"duration":0.29,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":70.49,"duration":0.19,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":70.68,"duration":0.28,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":70.99,"duration":0.2,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":71.27,"duration":0.24,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":71.97,"duration":0.19,"midi":67,"note":"G4","frequency":392,"lyric":""},
    {"time":72.14,"duration":0.29,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":72.43,"duration":0.17,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":72.81,"duration":0.27,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":73.38,"duration":0.24,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":74.07,"duration":0.15,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":74.24,"duration":0.2,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":74.59,"duration":0.16,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":74.78,"duration":0.19,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":74.97,"duration":0.24,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":75.22,"duration":0.38,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":75.69,"duration":0.19,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":76.11,"duration":0.15,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":76.26,"duration":0.34,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":76.59,"duration":0.15,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":76.74,"duration":0.16,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":77.48,"duration":0.23,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":77.71,"duration":0.17,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":78.01,"duration":0.19,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":78.34,"duration":0.23,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":78.68,"duration":0.5,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":79.4,"duration":0.23,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":79.64,"duration":0.31,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":80.28,"duration":0.28,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":80.8,"duration":0.15,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":81.82,"duration":0.19,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":82.01,"duration":0.29,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":82.3,"duration":0.22,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":82.52,"duration":0.23,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":82.75,"duration":0.15,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":82.98,"duration":0.16,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":83.21,"duration":0.26,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":83.47,"duration":0.22,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":83.7,"duration":0.21,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":84.09,"duration":0.16,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":84.25,"duration":0.28,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":84.56,"duration":0.29,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":85.03,"duration":0.26,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":85.28,"duration":0.16,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":85.42,"duration":0.35,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":86.34,"duration":0.22,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":86.56,"duration":0.36,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":86.93,"duration":0.2,"midi":67,"note":"G4","frequency":392,"lyric":""},
    {"time":87.27,"duration":0.29,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":87.56,"duration":0.29,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":87.85,"duration":0.16,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":88.04,"duration":0.2,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":88.28,"duration":0.2,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":88.51,"duration":0.31,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":88.86,"duration":0.24,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":89.11,"duration":0.15,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":89.26,"duration":0.36,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":90.05,"duration":0.3,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":90.45,"duration":0.15,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":90.7,"duration":0.23,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":90.93,"duration":0.17,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":91.18,"duration":0.17,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":91.38,"duration":0.2,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":91.63,"duration":0.31,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":91.94,"duration":0.17,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":92.14,"duration":0.19,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":92.32,"duration":0.21,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":92.58,"duration":0.15,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":92.82,"duration":0.15,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":93.08,"duration":0.41,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":93.85,"duration":0.21,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":94.06,"duration":0.17,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":94.53,"duration":0.23,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":94.76,"duration":0.22,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":95.02,"duration":0.17,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":95.24,"duration":0.21,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":95.47,"duration":0.29,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":95.76,"duration":0.16,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":95.91,"duration":0.15,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":96.2,"duration":0.19,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":96.64,"duration":0.19,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":96.82,"duration":0.16,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":97.05,"duration":0.26,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":98,"duration":0.23,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":98.02,"duration":0.15,"midi":77,"note":"F5","frequency":698.46,"lyric":""},
    {"time":98.49,"duration":0.29,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":99.13,"duration":0.17,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":99.4,"duration":0.37,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":99.76,"duration":0.15,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":100.03,"duration":0.17,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":100.26,"duration":0.24,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":100.51,"duration":0.15,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":100.76,"duration":0.48,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":101.23,"duration":0.22,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":101.46,"duration":0.23,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":101.69,"duration":0.16,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":101.95,"duration":0.22,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":103.01,"duration":0.16,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":103.41,"duration":0.31,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":104.16,"duration":0.17,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":104.63,"duration":0.2,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":104.82,"duration":0.26,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":105.08,"duration":0.16,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":105.24,"duration":0.3,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":105.8,"duration":0.37,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":106.61,"duration":0.39,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":107.01,"duration":0.26,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":107.26,"duration":0.24,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":107.51,"duration":0.23,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":107.74,"duration":0.29,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":108.07,"duration":0.15,"midi":67,"note":"G4","frequency":392,"lyric":""},
    {"time":108.66,"duration":0.26,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":108.91,"duration":0.24,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":109.16,"duration":0.16,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":109.6,"duration":0.17,"midi":61,"note":"C#4","frequency":277.18,"lyric":""},
    {"time":109.77,"duration":0.27,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":110.09,"duration":0.26,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":110.34,"duration":0.31,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":111.55,"duration":0.17,"midi":54,"note":"F#3","frequency":185,"lyric":""},
    {"time":112.02,"duration":0.3,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":112.32,"duration":0.24,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":112.56,"duration":0.16,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":112.74,"duration":0.26,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":112.99,"duration":0.26,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":113.47,"duration":0.17,"midi":64,"note":"E4","frequency":329.63,"lyric":""},
    {"time":113.64,"duration":0.26,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":113.96,"duration":0.15,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":114.22,"duration":0.17,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":114.47,"duration":0.22,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":114.71,"duration":0.22,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":114.94,"duration":0.24,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":115.2,"duration":0.16,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":115.4,"duration":0.17,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":115.66,"duration":0.15,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":115.91,"duration":0.22,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":116.13,"duration":0.49,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":116.62,"duration":0.21,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":116.82,"duration":0.24,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":117.37,"duration":0.3,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":118.34,"duration":0.15,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":118.5,"duration":0.15,"midi":64,"note":"E4","frequency":329.63,"lyric":""},
    {"time":119.21,"duration":0.17,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":119.47,"duration":0.19,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":119.68,"duration":0.28,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":119.96,"duration":0.45,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":120.55,"duration":0.36,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":121.21,"duration":0.31,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":121.66,"duration":0.15,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":122.11,"duration":0.27,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":122.38,"duration":0.48,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":122.85,"duration":0.26,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":123.11,"duration":0.17,"midi":65,"note":"F4","frequency":349.23,"lyric":""},
    {"time":123.41,"duration":0.19,"midi":67,"note":"G4","frequency":392,"lyric":""},
    {"time":124.03,"duration":0.27,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":124.29,"duration":0.22,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":124.52,"duration":0.2,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":124.99,"duration":0.4,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":125.41,"duration":0.17,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":125.58,"duration":0.16,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":125.75,"duration":0.26,"midi":57,"note":"A3","frequency":220,"lyric":""},
    {"time":127.34,"duration":0.2,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":127.61,"duration":0.19,"midi":64,"note":"E4","frequency":329.63,"lyric":""},
    {"time":127.79,"duration":0.57,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":128.36,"duration":0.16,"midi":63,"note":"D#4","frequency":311.13,"lyric":""},
    {"time":128.52,"duration":0.22,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":128.84,"duration":0.27,"midi":64,"note":"E4","frequency":329.63,"lyric":""},
    {"time":129.08,"duration":0.28,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":129.36,"duration":0.36,"midi":62,"note":"D4","frequency":293.66,"lyric":""},
    {"time":129.89,"duration":0.65,"midi":60,"note":"C4","frequency":261.63,"lyric":""},
    {"time":130.66,"duration":0.23,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":130.89,"duration":0.35,"midi":58,"note":"A#3","frequency":233.08,"lyric":""},
    {"time":134.02,"duration":0.31,"midi":34,"note":"A#1","frequency":58.27,"lyric":""}
      ]
      },
    },
  });
  console.log('✅ Created:', laBachata.title);
  console.log('   URL:', laBachata.audioUrl);
  console.log('');

  // ============================================
  // CANCIÓN: COLOR ESPERANZA
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
          { "time": 4.0, "duration": 0.4, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "Sé" },
          { "time": 4.6, "duration": 0.2, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "que" },
          { "time": 4.8, "duration": 0.2, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "hay" },
          { "time": 5.0, "duration": 0.2, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "en" },
          { "time": 5.2, "duration": 0.2, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "tus" },
          { "time": 5.4, "duration": 0.4, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "o" },
          { "time": 5.8, "duration": 0.8, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "jos" },

          { "time": 7.0, "duration": 0.3, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "con" },
          { "time": 7.3, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "so" },
          { "time": 7.6, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "lo" },
          { "time": 7.9, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "mi" },
          { "time": 8.2, "duration": 0.8, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "rar" },

          // "Que estás cansado..."
          { "time": 11.5, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "Que" },
          { "time": 11.8, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "es" },
          { "time": 12.1, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "tás" },
          { "time": 12.4, "duration": 0.3, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "can" },
          { "time": 12.7, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "sa" },
          { "time": 13.0, "duration": 0.6, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "do" },

          { "time": 14.2, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "de an" },
          { "time": 14.5, "duration": 0.3, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "dar" },
          { "time": 14.8, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "y" },
          { "time": 15.1, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "de an" },
          { "time": 15.4, "duration": 0.8, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "dar" },

          // "Y caminar..."
          { "time": 18.5, "duration": 0.3, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "Y" },
          { "time": 18.8, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "ca" },
          { "time": 19.1, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "mi" },
          { "time": 19.4, "duration": 0.6, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "nar" },

          { "time": 20.5, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "gi" },
          { "time": 20.8, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "ran" },
          { "time": 21.1, "duration": 0.3, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "do" },
          { "time": 21.4, "duration": 0.3, "midi": 64, "note": "E4", "frequency": midiToFrequency(64), "lyric": "siem" },
          { "time": 21.7, "duration": 0.3, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "pre" },
          { "time": 22.0, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "en" },
          { "time": 22.3, "duration": 0.3, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "un" },
          { "time": 22.6, "duration": 0.8, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "lu" },
          { "time": 23.0, "duration": 0.8, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "gar" },

          // --- PRE-CORO ---
          { "time": 26.5, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "Sé" },
          { "time": 26.8, "duration": 0.3, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "que" },
          { "time": 27.1, "duration": 0.3, "midi": 72, "note": "C5", "frequency": midiToFrequency(72), "lyric": "las" },
          { "time": 27.4, "duration": 0.3, "midi": 72, "note": "C5", "frequency": midiToFrequency(72), "lyric": "ven" },
          { "time": 27.7, "duration": 0.3, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "ta" },
          { "time": 28.0, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "nas" },
          { "time": 28.3, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "se" },
          { "time": 28.6, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "pue" },
          { "time": 28.9, "duration": 0.3, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "den" },
          { "time": 29.2, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "a" },
          { "time": 29.5, "duration": 0.6, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "brir" },

          { "time": 30.5, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "Cam" },
          { "time": 30.8, "duration": 0.3, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "biar" },
          { "time": 31.1, "duration": 0.3, "midi": 72, "note": "C5", "frequency": midiToFrequency(72), "lyric": "el" },
          { "time": 31.4, "duration": 0.3, "midi": 72, "note": "C5", "frequency": midiToFrequency(72), "lyric": "ai" },
          { "time": 31.7, "duration": 0.3, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "re" },
          { "time": 32.0, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "de" },
          { "time": 32.3, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "pen" },
          { "time": 32.6, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "de" },
          { "time": 32.9, "duration": 0.3, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "de" },
          { "time": 33.2, "duration": 0.8, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "ti" },

          { "time": 34.5, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "Te a" },
          { "time": 34.8, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "yu" },
          { "time": 35.1, "duration": 0.3, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "da" },
          { "time": 35.4, "duration": 0.8, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "rá" },

          { "time": 36.5, "duration": 0.3, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "Va" },
          { "time": 36.8, "duration": 0.3, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "le" },
          { "time": 37.1, "duration": 0.3, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "la" },
          { "time": 37.4, "duration": 0.3, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "pe" },
          { "time": 37.7, "duration": 0.6, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "na" },

          { "time": 38.5, "duration": 0.3, "midi": 64, "note": "E4", "frequency": midiToFrequency(64), "lyric": "u" },
          { "time": 38.8, "duration": 0.3, "midi": 62, "note": "D4", "frequency": midiToFrequency(62), "lyric": "na" },
          { "time": 39.1, "duration": 0.3, "midi": 60, "note": "C4", "frequency": midiToFrequency(60), "lyric": "vez" },
          { "time": 39.4, "duration": 0.8, "midi": 60, "note": "C4", "frequency": midiToFrequency(60), "lyric": "más" },

          // --- CORO ---
          { "time": 40.5, "duration": 0.4, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "Sa" },
          { "time": 40.9, "duration": 0.4, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "ber" },
          { "time": 41.3, "duration": 0.4, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "que" },
          { "time": 41.7, "duration": 0.4, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "se" },
          { "time": 42.1, "duration": 0.6, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "pue" },
          { "time": 42.7, "duration": 0.8, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "de" },

          { "time": 44.0, "duration": 0.4, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "Que" },
          { "time": 44.4, "duration": 0.4, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "rer" },
          { "time": 44.8, "duration": 0.4, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "que" },
          { "time": 45.2, "duration": 0.4, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "se" },
          { "time": 45.6, "duration": 0.6, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "pue" },
          { "time": 46.2, "duration": 0.8, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "da" },

          { "time": 47.5, "duration": 0.4, "midi": 65, "note": "F4", "frequency": midiToFrequency(65), "lyric": "Qui" },
          { "time": 47.9, "duration": 0.4, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "tar" },
          { "time": 48.3, "duration": 0.4, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "se" },
          { "time": 48.7, "duration": 0.4, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "los" },
          { "time": 49.1, "duration": 0.6, "midi": 72, "note": "C5", "frequency": midiToFrequency(72), "lyric": "mie" },
          { "time": 49.7, "duration": 0.8, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "dos" },

          { "time": 51.0, "duration": 0.4, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "Sa" },
          { "time": 51.4, "duration": 0.4, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "car" },
          { "time": 51.8, "duration": 0.4, "midi": 72, "note": "C5", "frequency": midiToFrequency(72), "lyric": "los" },
          { "time": 52.2, "duration": 0.4, "midi": 70, "note": "Bb4", "frequency": midiToFrequency(70), "lyric": "a" },
          { "time": 52.6, "duration": 0.6, "midi": 69, "note": "A4", "frequency": midiToFrequency(69), "lyric": "fue" },
          { "time": 53.2, "duration": 0.8, "midi": 67, "note": "G4", "frequency": midiToFrequency(67), "lyric": "ra" }
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
  console.log(`   - Songs created: 1`);
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