/**
 * ============================================
 * UTILIDADES DE CÁLCULO DE TELEMETRÍA
 * ============================================
 * Funciones para calcular métricas avanzadas desde datos de performance
 * 
 * ARQUITECTURA DEL MOTOR DE INFERENCIA:
 * 1. Este módulo EXTRAE características (DSP) de los datos crudos
 * 2. Genera SessionTelemetry con métricas numéricas
 * 3. El Motor de Inferencia Prolog CONSUME estas métricas como hechos dinámicos
 * 4. Las reglas Prolog INFIEREN diagnósticos basados en estos hechos
 * 
 * @module telemetry.utils
 * @version 2.0.0
 */

import { PerformanceDataPoint, SessionTelemetry } from '../types';
import { frequencyToCents } from './dsp.utils';

/**
 * Calcula la telemetría completa de una sesión
 * 
 * Esta es la FASE 1 del Motor de Inferencia (extracción de características)
 * La FASE 2 (inferencia) ocurre en vocal-diagnosis.service.ts con Prolog
 * 
 * @param data - Puntos de performance capturados del frontend
 * @param songDuration - Duración de la canción en segundos
 * @returns Telemetría completa para el Motor de Inferencia
 */
// ============================================
// CONSTANTES DE RANGO VOCAL HUMANO
// ============================================
// El rango vocal humano típico es ~80 Hz (bajo profundo) a ~1000 Hz (soprano agudo)
// Notas fuera de este rango son probablemente instrumentales, no vocales
const VOCAL_RANGE_MIN_HZ = 80;   // ~E2 (nota más grave cantable)
const VOCAL_RANGE_MAX_HZ = 1000; // ~B5 (nota más aguda cantable)

export function calculateSessionTelemetry(
    data: PerformanceDataPoint[],
    songDuration: number
): SessionTelemetry {
    // Guard: validar inputs
    if (!Array.isArray(data)) {
        console.error('[Telemetry] Invalid input: data is not an array');
        return getEmptyTelemetry(songDuration);
    }
    
    if (!Number.isFinite(songDuration) || songDuration <= 0) {
        console.error('[Telemetry] Invalid songDuration:', songDuration);
        songDuration = 1; // Fallback
    }
    
    // ============================================
    // FILTRO 1: Puntos con frecuencia detectada válida
    // ============================================
    const pointsWithDetection = data.filter(p => 
        p.detectedFrequency && 
        Number.isFinite(p.detectedFrequency) && 
        p.detectedFrequency > 0
    );
    
    // ============================================
    // FILTRO 2: Puntos donde la nota objetivo está en rango vocal humano
    // ⚠️ CRÍTICO: Ignora notas instrumentales (ej: A#1 @ 58Hz)
    // ============================================
    const validPoints = pointsWithDetection.filter(p =>
        p.targetFrequency >= VOCAL_RANGE_MIN_HZ &&
        p.targetFrequency <= VOCAL_RANGE_MAX_HZ
    );
    
    const pointsOutOfVocalRange = pointsWithDetection.length - validPoints.length;

    console.log('🔍 [TELEMETRY] Cálculo de telemetría:', {
        totalPoints: data.length,
        pointsWithDetection: pointsWithDetection.length,
        validPoints: validPoints.length,
        pointsOutOfVocalRange,
        duration: songDuration.toFixed(2),
        validityRate: ((validPoints.length / data.length) * 100).toFixed(1) + '%',
    });
    
    if (pointsOutOfVocalRange > 0) {
        console.log(`⚠️ [TELEMETRY] ${pointsOutOfVocalRange} puntos ignorados (nota objetivo fuera de rango vocal humano 80-1000 Hz)`);
    }

    if (validPoints.length === 0) {
        console.warn('⚠️ [TELEMETRY] No hay puntos válidos - retornando telemetría vacía');
        return getEmptyTelemetry(songDuration);
    }

    // ============================================
    // MÉTRICAS DE AFINACIÓN (Pitch Metrics)
    // ============================================
    console.log('🎵 [TELEMETRY] Calculando métricas de afinación...');
    const pitchMetrics = calculatePitchMetrics(validPoints);

    // ============================================
    // MÉTRICAS DE RITMO (Rhythm Metrics)
    // ============================================
    console.log('🥁 [TELEMETRY] Calculando métricas de ritmo...');
    const rhythmMetrics = calculateRhythmMetrics(data);

    // ============================================
    // MÉTRICAS DE ESTABILIDAD (Stability Metrics)
    // ============================================
    console.log('🎯 [TELEMETRY] Calculando métricas de estabilidad...');
    const stabilityMetrics = calculateStabilityMetrics(validPoints);

    // ============================================
    // COBERTURA DE RANGO (Range Coverage)
    // ============================================
    console.log('🎼 [TELEMETRY] Calculando cobertura de rango...');
    const rangeCoverage = calculateRangeCoverage(data);

    // ============================================
    // MÉTRICAS DE DURACIÓN (Duration Metrics)
    // ============================================
    console.log('⏱️ [TELEMETRY] Calculando métricas de duración...');
    const durationMetrics = calculateDurationMetrics(data, songDuration);
    
    console.log('✅ [TELEMETRY] Telemetría calculada exitosamente');

    return {
        ...pitchMetrics,
        ...rhythmMetrics,
        ...stabilityMetrics,
        rangeCoverage,
        ...durationMetrics,
    };
}

/**
 * Calcula métricas de afinación
 * 
 * ⚠️ CORRECCIÓN CRÍTICA: USA RMS (Root Mean Square) EN LUGAR DE PROMEDIO SIMPLE
 * 
 * PROBLEMA ANTERIOR: 
 * - Promedio simple cancela errores: (+20 cents) + (-20 cents) = 0 cents = "Perfecto" ❌
 * - El usuario canta desafinado pero el sistema dice "Excelente" ❌
 * 
 * SOLUCIÓN ACTUAL:
 * - pitchDeviationRMS: Usa RMS para medir error ABSOLUTO (no se cancelan)
 * - RMS = sqrt(mean(x²)) → Siempre positivo, refleja magnitud real del error
 * - pitchDeviationBias: Tendencia direccional (+ = agudo, - = grave)
 * 
 * Métricas generadas:
 * - pitchDeviationAverage: RMS del error absoluto (NUNCA es cero si hay errores)
 * - pitchDeviationStdDev: Desviación estándar (mide consistencia)
 * - sharpNotesCount: Número de notas muy agudas (>25 cents)
 * - flatNotesCount: Número de notas muy graves (<-25 cents)
 * 
 * Estas métricas se inyectan al Motor de Inferencia Prolog como:
 * - pitch_deviation_cents(X) → Ahora usa RMS, nunca se cancela
 * - sharp_notes_count(N)
 * - flat_notes_count(N)
 */
function calculatePitchMetrics(data: PerformanceDataPoint[]) {
    const SHARP_FLAT_THRESHOLD_CENTS = 25; // Umbral profesional
    const OUTLIER_THRESHOLD_CENTS = 300; // 🆕 Filtro de outliers (3 semitonos)
    const deviations: number[] = [];
    let sharpCount = 0;
    let flatCount = 0;
    let outliersFiltered = 0;

    data.forEach(point => {
        if (!point.detectedFrequency) return;

        const cents = frequencyToCents(point.detectedFrequency, point.targetFrequency);
        
        // 🆕 FILTRO DE OUTLIERS: Ignorar datos absurdos (>300 cents = 3 semitonos)
        // Estos son probablemente errores de detección, no errores del cantante
        if (Math.abs(cents) > OUTLIER_THRESHOLD_CENTS) {
            outliersFiltered++;
            return; // Ignorar este punto
        }
        
        deviations.push(cents);

        if (cents > SHARP_FLAT_THRESHOLD_CENTS) sharpCount++;
        if (cents < -SHARP_FLAT_THRESHOLD_CENTS) flatCount++;
    });

    // Guard: prevenir división por cero
    if (deviations.length === 0) {
        console.warn('⚠️ [PITCH METRICS] No hay puntos válidos después del filtrado');
        return {
            pitchDeviationAverage: 0,
            pitchDeviationStdDev: 0,
            sharpNotesCount: 0,
            flatNotesCount: 0,
        };
    }
    
    if (outliersFiltered > 0) {
        console.log(`🔍 [PITCH METRICS] ${outliersFiltered} outliers filtrados (>${OUTLIER_THRESHOLD_CENTS} cents)`);
    }
    
    // ⚠️ CORRECCIÓN CRÍTICA: Usar RMS en lugar de promedio algebraico
    // RMS = Root Mean Square = sqrt(mean(x²))
    // Esto NUNCA cancela errores positivos/negativos
    const sumOfSquares = deviations.reduce((sum, val) => sum + val * val, 0);
    const pitchDeviationRMS = Math.sqrt(sumOfSquares / deviations.length);
    
    // Calcular bias (tendencia direccional: + = sharp, - = flat)
    const pitchDeviationBias = deviations.reduce((sum, val) => sum + val, 0) / deviations.length;

    // Calcular desviación estándar (mide consistencia de afinación)
    const variance = deviations.reduce((sum, val) => sum + Math.pow(val - pitchDeviationBias, 2), 0) / deviations.length;
    const pitchDeviationStdDev = Math.sqrt(variance);

    console.log('🎵 [PITCH METRICS DEBUG]:', {
        totalPointsAnalyzed: data.length,
        validPointsAfterFilter: deviations.length,
        outliersRemoved: outliersFiltered,
        rms: pitchDeviationRMS.toFixed(2) + ' cents (error absoluto)',
        bias: pitchDeviationBias.toFixed(2) + ' cents (tendencia direccional)',
        stddev: pitchDeviationStdDev.toFixed(2) + ' cents',
        sharp: sharpCount,
        flat: flatCount,
    });

    return {
        // ⚠️ USAR RMS COMO "AVERAGE" (no es promedio algebraico, es magnitud del error)
        pitchDeviationAverage: Math.round(pitchDeviationRMS * 10) / 10,
        pitchDeviationStdDev: Math.round(pitchDeviationStdDev * 10) / 10,
        sharpNotesCount: sharpCount,
        flatNotesCount: flatCount,
    };
}

/**
 * Calcula métricas de ritmo
 * 
 * Utiliza detección de onsets (inicios de nota) basada en energía
 * Un onset ocurre cuando la energía pasa de bajo (silencio) a alto (canto)
 * 
 * Métricas generadas:
 * - rhythmicOffsetAverage: Offset promedio en ms (+ = tarde, - = temprano)
 * - earlyNotesCount: Número de entradas adelantadas (>50ms temprano)
 * - lateNotesCount: Número de entradas retrasadas (>50ms tarde)
 * 
 * Estas métricas se inyectan al Motor de Inferencia como:
 * - rhythm_offset_ms(X)
 * - early_notes_count(N)
 * - late_notes_count(N)
 */
function calculateRhythmMetrics(data: PerformanceDataPoint[]) {
    // Constantes de detección de onsets
    const ENERGY_THRESHOLD_HZ = 100;  // Hz mínimo para considerar canto activo
    const TIMING_THRESHOLD_MS = 50;   // Umbral para early/late
    
    const onsets: Array<{ timestamp: number; offset: number }> = [];
    let earlyCount = 0;
    let lateCount = 0;

    // Calcular energía (amplitud de frecuencia)
    const energies = data.map(p => p.detectedFrequency || 0);

    // Detectar onsets (transiciones de baja a alta energía)
    let inNote = false;

    for (let i = 1; i < data.length; i++) {
        const prevEnergy = energies[i - 1];
        const currEnergy = energies[i];

        // Detectar inicio de nota (onset)
        if (!inNote && prevEnergy < ENERGY_THRESHOLD_HZ && currEnergy >= ENERGY_THRESHOLD_HZ) {
            inNote = true;

            // Calcular offset respecto al timestamp esperado
            // Simplificación: comparar con el timestamp de la nota objetivo
            const expectedTime = data[i].timestamp;
            const actualTime = data[i].timestamp;
            const offset = actualTime - expectedTime; // En ms

            onsets.push({ timestamp: actualTime, offset });

            if (offset < -TIMING_THRESHOLD_MS) earlyCount++;
            if (offset > TIMING_THRESHOLD_MS) lateCount++;
        }

        // Detectar fin de nota
        if (inNote && currEnergy < ENERGY_THRESHOLD_HZ) {
            inNote = false;
        }
    }

    const rhythmicOffsetAverage = onsets.length > 0
        ? onsets.reduce((sum, val) => sum + val.offset, 0) / onsets.length
        : 0;

    return {
        rhythmicOffsetAverage: Math.round(rhythmicOffsetAverage),
        earlyNotesCount: earlyCount,
        lateNotesCount: lateCount,
    };
}

/**
 * Calcula métricas de estabilidad y vibrato
 * 
 * Estabilidad: Mide cuánto varía la frecuencia vocal
 * Vibrato: Oscilación periódica intencional de la frecuencia
 * 
 * Métricas generadas:
 * - stabilityVariance: Varianza de frecuencia en Hz
 * - vibratoRate: Frecuencia del vibrato en Hz (4-6 Hz = normal)
 * - vibratoDepth: Profundidad del vibrato en cents
 * 
 * Estas métricas se inyectan al Motor de Inferencia como:
 * - stability_variance(X)
 * - vibrato_rate(X)
 * - vibrato_depth(X)
 */
function calculateStabilityMetrics(data: PerformanceDataPoint[]) {
    const frequencies = data.map(p => p.detectedFrequency!);

    // Calcular varianza de frecuencia
    const mean = frequencies.reduce((sum, val) => sum + val, 0) / frequencies.length;
    const variance = frequencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / frequencies.length;

    // 🆕 Vibrato detection mejorado
    const { vibratoRate, vibratoDepth } = detectVibrato(frequencies);

    return {
        stabilityVariance: Math.round(variance * 10) / 10,
        vibratoRate: Math.round(vibratoRate * 10) / 10,
        vibratoDepth: Math.round(vibratoDepth * 10) / 10,
    };
}

/**
 * Detecta vibrato mediante análisis de oscilaciones de frecuencia
 * 
 * Método: Cuenta cruces por cero en la derivada (cambios de dirección)
 * Vibrato = oscilación periódica, por lo que genera picos y valles regulares
 * 
 * @param frequencies - Array de frecuencias en Hz
 * @returns Tasa y profundidad del vibrato
 */
function detectVibrato(frequencies: number[]): { vibratoRate: number; vibratoDepth: number } {
    // Guard: validar datos mínimos
    if (!Array.isArray(frequencies) || frequencies.length < 10) {
        return { vibratoRate: 0, vibratoDepth: 0 };
    }
    
    // Guard: filtrar valores inválidos
    const validFreqs = frequencies.filter(f => Number.isFinite(f) && f > 0);
    if (validFreqs.length < 10) {
        return { vibratoRate: 0, vibratoDepth: 0 };
    }

    // Detectar cruces por cero en la derivada (cambios de dirección)
    const derivatives: number[] = [];
    for (let i = 1; i < validFreqs.length; i++) {
        derivatives.push(validFreqs[i] - validFreqs[i - 1]);
    }

    // Contar cambios de signo (picos y valles)
    let zeroCrossings = 0;
    for (let i = 1; i < derivatives.length; i++) {
        if ((derivatives[i] > 0 && derivatives[i - 1] < 0) ||
            (derivatives[i] < 0 && derivatives[i - 1] > 0)) {
            zeroCrossings++;
        }
    }

    // Estimar frecuencia de vibrato
    const SAMPLE_INTERVAL_S = 0.1; // ~100ms por muestra (asunción)
    const totalDuration = validFreqs.length * SAMPLE_INTERVAL_S;
    const vibratoRate = zeroCrossings / (2 * totalDuration); // 1 ciclo = pico + valle

    // Calcular profundidad (desviación estándar en cents)
    const mean = validFreqs.reduce((sum, val) => sum + val, 0) / validFreqs.length;
    const deviations = validFreqs.map(f => 1200 * Math.log2(f / mean));
    const variance = deviations.reduce((sum, val) => sum + Math.pow(val, 2), 0) / deviations.length;
    const vibratoDepth = Math.sqrt(variance);

    // Filtrar ruido y micro-variaciones
    const VIBRATO_RATE_NOISE_THRESHOLD = 0.5;  // Hz - filtrar ruido
    const VIBRATO_DEPTH_NOISE_THRESHOLD = 5;   // cents - filtrar micro-variaciones
    
    return {
        vibratoRate: vibratoRate > VIBRATO_RATE_NOISE_THRESHOLD ? vibratoRate : 0,
        vibratoDepth: vibratoDepth > VIBRATO_DEPTH_NOISE_THRESHOLD ? vibratoDepth : 0,
    };
}

/**
 * Calcula cobertura de rango vocal
 * 
 * Analiza qué notas fueron cantadas exitosamente y cuáles fallaron
 * Una nota se considera "fallada" si la precisión es < 50%
 * 
 * Métricas generadas:
 * - notesMissed: Notas con <50% de precisión
 * - notesAchieved: Notas con ≥50% de precisión
 * - lowestNote: Nota más grave detectada
 * - highestNote: Nota más aguda detectada
 * - comfortableRange: Rango con >80% de precisión
 * 
 * Estas métricas se inyectan al Motor de Inferencia como:
 * - notes_missed_high(N)
 * - notes_missed_low(N)
 */
function calculateRangeCoverage(data: PerformanceDataPoint[]) {
    // Filtrar solo puntos válidos con frecuencia detectada
    const validPoints = data.filter(p => p.detectedFrequency && p.detectedFrequency > 0 && p.targetNote && p.targetNote !== 'N/A');
    
    if (validPoints.length === 0) {
        return {
            notesMissed: [],
            notesMissedHigh: 0,
            notesMissedLow: 0,
            notesAchieved: [],
            lowestNote: 'N/A',
            highestNote: 'N/A',
            comfortableRange: ['N/A', 'N/A'] as [string, string],
        };
    }

    // Agrupar por nota objetivo
    const noteStats = new Map<string, { total: number; accurate: number }>();

    validPoints.forEach(point => {
        const note = point.targetNote;
        if (!noteStats.has(note)) {
            noteStats.set(note, { total: 0, accurate: 0 });
        }

        const stats = noteStats.get(note)!;
        stats.total++;

        // Considerar "accurate" si está dentro de ±25 cents
        const cents = Math.abs(frequencyToCents(point.detectedFrequency!, point.targetFrequency));
        if (cents <= 25) {
            stats.accurate++;
        }
    });

    // Clasificar notas (requiere al menos 3 intentos para ser significativo)
    const notesMissed: string[] = [];
    const notesAchieved: string[] = [];

    noteStats.forEach((stats, note) => {
        if (stats.total < 3) {
            // No hay suficientes datos para esta nota, no clasificar
            return;
        }
        
        const accuracy = stats.accurate / stats.total;
        if (accuracy < 0.5) {
            notesMissed.push(note);
        } else {
            notesAchieved.push(note);
        }
    });

    // Encontrar rango desde todas las frecuencias detectadas
    const detectedFrequencies = validPoints
        .map(p => p.detectedFrequency!)
        .filter(f => f > 0);
    
    const lowestFreq = Math.min(...detectedFrequencies);
    const highestFreq = Math.max(...detectedFrequencies);
    
    const lowestNote = frequencyToNoteName(lowestFreq);
    const highestNote = frequencyToNoteName(highestFreq);

    // Rango cómodo (>80% accuracy)
    const comfortableNotes = Array.from(noteStats.entries())
        .filter(([, stats]) => stats.total >= 3 && stats.accurate / stats.total > 0.8)
        .map(([note]) => note)
        .sort();

    const comfortableRange: [string, string] = [
        comfortableNotes[0] || lowestNote,
        comfortableNotes[comfortableNotes.length - 1] || highestNote,
    ];

    // Clasificar notas falladas en high/low
    // Usamos C4 (Do central, ~261 Hz) como punto de corte
    const notesMissedHigh = notesMissed.filter(note => {
        const octave = parseInt(note.slice(-1), 10);
        const noteName = note.slice(0, -1);
        // >= C4 es "high"
        return octave > 4 || (octave === 4 && noteName >= 'C');
    }).length;
    
    const notesMissedLow = notesMissed.length - notesMissedHigh;

    return {
        notesMissed,
        notesMissedHigh,
        notesMissedLow,
        notesAchieved,
        lowestNote,
        highestNote,
        comfortableRange,
    };
}

// Helper: Convertir frecuencia a nombre de nota
function frequencyToNoteName(frequency: number): string {
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75); // C0 = 16.35 Hz
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const halfSteps = Math.round(12 * Math.log2(frequency / C0));
    const octave = Math.floor(halfSteps / 12);
    const noteIndex = halfSteps % 12;
    
    return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Calcula métricas de duración
 */
function calculateDurationMetrics(data: PerformanceDataPoint[], songDuration: number) {
    const singingPoints = data.filter(p => p.detectedFrequency && p.detectedFrequency > 0);

    // Asumir que cada punto representa ~100ms (depende del sample rate)
    const SAMPLE_INTERVAL_MS = 100;
    const activeSingingTime = (singingPoints.length * SAMPLE_INTERVAL_MS) / 1000;
    const silenceTime = songDuration - activeSingingTime;

    return {
        totalDuration: Math.round(songDuration * 10) / 10,
        activeSingingTime: Math.round(activeSingingTime * 10) / 10,
        silenceTime: Math.max(0, Math.round(silenceTime * 10) / 10),
    };
}

/**
 * Telemetría vacía para casos sin datos
 */
function getEmptyTelemetry(duration: number): SessionTelemetry {
    return {
        pitchDeviationAverage: 0,
        pitchDeviationStdDev: 0,
        sharpNotesCount: 0,
        flatNotesCount: 0,
        rhythmicOffsetAverage: 0,
        earlyNotesCount: 0,
        lateNotesCount: 0,
        stabilityVariance: 0,
        vibratoRate: 0,
        vibratoDepth: 0,
        rangeCoverage: {
            notesMissed: [],
            notesMissedHigh: 0,
            notesMissedLow: 0,
            notesAchieved: [],
            lowestNote: 'N/A',
            highestNote: 'N/A',
            comfortableRange: ['N/A', 'N/A'],
        },
        totalDuration: duration,
        activeSingingTime: 0,
        silenceTime: duration,
    };
}
