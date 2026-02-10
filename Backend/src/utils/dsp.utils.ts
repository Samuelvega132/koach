/**
 * ============================================
 * UTILIDADES DSP - Digital Signal Processing
 * ============================================
 * Funciones auxiliares para cálculos musicales utilizadas por el Motor de Inferencia
 * 
 * Estas funciones NO son parte del Sistema Experto (que está en Prolog),
 * sino que preparan los datos para que el Motor de Inferencia pueda procesarlos.
 * 
 * @module dsp.utils
 * @version 2.0.0
 */

/**
 * Convierte una nota en notación científica a frecuencia en Hz
 * 
 * Fórmula: f = 440 * 2^((n-69)/12)
 * donde n es el número MIDI de la nota
 * 
 * @param note - Nota en formato científico (ej: "C4", "A#5")
 * @returns Frecuencia en Hz
 * @throws Error si el formato de nota es inválido
 * 
 * @example
 * noteToFrequency('A4') // 440
 * noteToFrequency('C4') // 261.63
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
 * 
 * 1 semitono = 100 cents
 * Fórmula: cents = 1200 * log2(f1/f2)
 * 
 * Valores positivos: detectedHz es más agudo que targetHz
 * Valores negativos: detectedHz es más grave que targetHz
 * 
 * @param detectedHz - Frecuencia detectada en Hz
 * @param targetHz - Frecuencia objetivo en Hz
 * @returns Diferencia en cents (+ = agudo, - = grave)
 * 
 * @example
 * frequencyToCents(440, 440) // 0 (afinado)
 * frequencyToCents(450, 440) // +38.5 (agudo)
 * frequencyToCents(430, 440) // -40.4 (grave)
 */
export function frequencyToCents(detectedHz: number, targetHz: number): number {
  // Guard: validar inputs
  if (!Number.isFinite(detectedHz) || !Number.isFinite(targetHz)) {
    console.warn('[DSP] Invalid frequency input:', { detectedHz, targetHz });
    return 0;
  }
  
  if (detectedHz <= 0 || targetHz <= 0) return 0;
  
  return 1200 * Math.log2(detectedHz / targetHz);
}

/**
 * Determina si una frecuencia está "afinada" dentro del umbral
 * 
 * Umbral estándar profesional: ±25 cents
 * Umbral estricto: ±10 cents
 * 
 * @param detectedHz - Frecuencia detectada en Hz
 * @param targetHz - Frecuencia objetivo en Hz
 * @param threshold - Umbral en cents (default: 25)
 * @returns true si está afinada dentro del umbral
 * 
 * @example
 * isInTune(440, 440, 25) // true
 * isInTune(450, 440, 25) // false (38.5 cents de diferencia)
 */
export function isInTune(detectedHz: number, targetHz: number, threshold = 25): boolean {
  // Guard: validar umbral
  if (threshold < 0) {
    console.warn('[DSP] Invalid threshold:', threshold);
    return false;
  }
  
  const cents = Math.abs(frequencyToCents(detectedHz, targetHz));
  return cents <= threshold;
}

/**
 * Calcula el jitter (variación) en cents entre mediciones consecutivas
 * 
 * El jitter mide la inestabilidad vocal (micro-fluctuaciones)
 * Valores bajos (<5 cents) = voz muy estable
 * Valores altos (>20 cents) = tremolo o inestabilidad
 * 
 * @param frequencies - Array de frecuencias detectadas en Hz
 * @returns Jitter promedio en cents
 * 
 * @example
 * calculateJitter([440, 441, 440]) // ~3.9 cents
 */
export function calculateJitter(frequencies: number[]): number {
  // Guard: validar array
  if (!Array.isArray(frequencies) || frequencies.length < 2) {
    return 0;
  }
  
  // Guard: filtrar valores inválidos
  const validFreqs = frequencies.filter(f => Number.isFinite(f) && f > 0);
  if (validFreqs.length < 2) return 0;

  let totalDeviation = 0;
  for (let i = 1; i < validFreqs.length; i++) {
    const cents = Math.abs(frequencyToCents(validFreqs[i], validFreqs[i - 1]));
    totalDeviation += cents;
  }

  return totalDeviation / (validFreqs.length - 1);
}

/**
 * Calcula el porcentaje de samples "estables"
 * 
 * Un sample es estable si el jitter con el anterior es < 10 cents
 * 
 * @param frequencies - Array de frecuencias detectadas en Hz
 * @returns Porcentaje de estabilidad (0-100)
 * 
 * @example
 * calculateStabilityPercentage([440, 441, 440, 441]) // ~100% (muy estable)
 * calculateStabilityPercentage([440, 460, 420, 450]) // ~0% (inestable)
 */
export function calculateStabilityPercentage(frequencies: number[]): number {
  // Guard: validar array
  if (!Array.isArray(frequencies) || frequencies.length < 2) {
    return 100; // Sin datos = asumir estabilidad perfecta
  }
  
  // Guard: filtrar valores inválidos
  const validFreqs = frequencies.filter(f => Number.isFinite(f) && f > 0);
  if (validFreqs.length < 2) return 100;

  const STABILITY_THRESHOLD_CENTS = 10;
  let stableCount = 0;
  
  for (let i = 1; i < validFreqs.length; i++) {
    const cents = Math.abs(frequencyToCents(validFreqs[i], validFreqs[i - 1]));
    if (cents < STABILITY_THRESHOLD_CENTS) {
      stableCount++;
    }
  }

  return (stableCount / (validFreqs.length - 1)) * 100;
}
