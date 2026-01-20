/**
 * ============================================
 * UTILIDADES DSP - Digital Signal Processing
 * ============================================
 * Funciones auxiliares para cálculos musicales
 */

/**
 * Convierte una nota en notación científica a frecuencia en Hz
 * Fórmula: f = 440 * 2^((n-69)/12)
 * donde n es el número MIDI de la nota
 */
export function noteToFrequency(note: string): number {
  const noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11,
  };

  const match = note.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) throw new Error(`Invalid note format: ${note}`);

  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const midiNote = 12 * (octave + 1) + noteMap[noteName];

  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Calcula la diferencia en cents entre dos frecuencias
 * 1 semitono = 100 cents
 * Fórmula: cents = 1200 * log2(f1/f2)
 */
export function frequencyToCents(detectedHz: number, targetHz: number): number {
  if (detectedHz <= 0 || targetHz <= 0) return 0;
  return 1200 * Math.log2(detectedHz / targetHz);
}

/**
 * Determina si una frecuencia está "afinada" dentro del umbral
 * Umbral estándar: ±25 cents
 */
export function isInTune(detectedHz: number, targetHz: number, threshold = 25): boolean {
  const cents = Math.abs(frequencyToCents(detectedHz, targetHz));
  return cents <= threshold;
}

/**
 * Calcula el jitter (variación) en cents entre mediciones consecutivas
 * Usado para medir estabilidad vocal
 */
export function calculateJitter(frequencies: number[]): number {
  if (frequencies.length < 2) return 0;

  let totalDeviation = 0;
  for (let i = 1; i < frequencies.length; i++) {
    const cents = Math.abs(frequencyToCents(frequencies[i], frequencies[i - 1]));
    totalDeviation += cents;
  }

  return totalDeviation / (frequencies.length - 1);
}

/**
 * Calcula el porcentaje de samples "estables" (jitter < 10 cents entre muestras)
 */
export function calculateStabilityPercentage(frequencies: number[]): number {
  if (frequencies.length < 2) return 100;

  let stableCount = 0;
  for (let i = 1; i < frequencies.length; i++) {
    const cents = Math.abs(frequencyToCents(frequencies[i], frequencies[i - 1]));
    if (cents < 10) stableCount++;
  }

  return (stableCount / (frequencies.length - 1)) * 100;
}
