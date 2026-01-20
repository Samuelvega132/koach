/**
 * ============================================
 * SEED DATA - Datos de Ejemplo
 * ============================================
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes
  await prisma.performanceLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.song.deleteMany();

  // ============================================
  // CANCIÓN 1: Happy Birthday
  // ============================================
  const happyBirthday = await prisma.song.create({
    data: {
      title: 'Happy Birthday',
      artist: 'Traditional',
      bpm: 120,
      key: 'C',
      audioUrl: 'https://example.com/audio/happy-birthday.mp3',
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

  console.log('✅ Created:', happyBirthday.title);

  // ============================================
  // CANCIÓN 2: Twinkle Twinkle Little Star
  // ============================================
  const twinkle = await prisma.song.create({
    data: {
      title: 'Twinkle Twinkle Little Star',
      artist: 'Traditional',
      bpm: 100,
      key: 'C',
      audioUrl: 'https://example.com/audio/twinkle.mp3',
      melodyData: {
        notes: [
          { start: 0.0, end: 1.0, note: 'C4', frequency: 261.63 },
          { start: 1.0, end: 2.0, note: 'C4', frequency: 261.63 },
          { start: 2.0, end: 3.0, note: 'G4', frequency: 392.0 },
          { start: 3.0, end: 4.0, note: 'G4', frequency: 392.0 },
          { start: 4.0, end: 5.0, note: 'A4', frequency: 440.0 },
          { start: 5.0, end: 6.0, note: 'A4', frequency: 440.0 },
          { start: 6.0, end: 8.0, note: 'G4', frequency: 392.0 },
        ],
      },
    },
  });

  console.log('✅ Created:', twinkle.title);

  // ============================================
  // CANCIÓN 3: Do-Re-Mi (Escala)
  // ============================================
  const doReMi = await prisma.song.create({
    data: {
      title: 'Do-Re-Mi Scale',
      artist: 'Practice',
      bpm: 60,
      key: 'C',
      audioUrl: 'https://example.com/audio/do-re-mi.mp3',
      melodyData: {
        notes: [
          { start: 0.0, end: 1.0, note: 'C4', frequency: 261.63 },
          { start: 1.0, end: 2.0, note: 'D4', frequency: 293.66 },
          { start: 2.0, end: 3.0, note: 'E4', frequency: 329.63 },
          { start: 3.0, end: 4.0, note: 'F4', frequency: 349.23 },
          { start: 4.0, end: 5.0, note: 'G4', frequency: 392.0 },
          { start: 5.0, end: 6.0, note: 'A4', frequency: 440.0 },
          { start: 6.0, end: 7.0, note: 'B4', frequency: 493.88 },
          { start: 7.0, end: 8.0, note: 'C5', frequency: 523.25 },
        ],
      },
    },
  });

  console.log('✅ Created:', doReMi.title);

  console.log('');
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
