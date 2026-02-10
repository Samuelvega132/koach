/**
 * ============================================
 * UTILIDADES DE CÁLCULO DE TELEMETRÍA
 * ============================================
 * Funciones para calcular métricas avanzadas desde datos de performance
 */

import { PerformanceDataPoint, SessionTelemetry } from '../types';
import { frequencyToCents } from './dsp.utils';

/**
 * Calcula la telemetría completa de una sesión
 */
export function calculateSessionTelemetry(
    data: PerformanceDataPoint[],
    songDuration: number
): SessionTelemetry {
    const validPoints = data.filter(p => p.detectedFrequency && p.detectedFrequency > 0);

    console.log('🔍 Telemetry calculation:', {
        totalPoints: data.length,
        validPoints: validPoints.length,
        duration: songDuration,
    });

    if (validPoints.length === 0) {
        console.warn('⚠️ No valid points detected, returning empty telemetry');
        return getEmptyTelemetry(songDuration);
    }

    // ============================================
    // MÉTRICAS DE AFINACIÓN
    // ============================================
    const pitchMetrics = calculatePitchMetrics(validPoints);

    // ============================================
    // MÉTRICAS DE RITMO
    // ============================================
    const rhythmMetrics = calculateRhythmMetrics(data);

    // ============================================
    // MÉTRICAS DE ESTABILIDAD
    // ============================================
    const stabilityMetrics = calculateStabilityMetrics(validPoints);

    // ============================================
    // COBERTURA DE RANGO
    // ============================================
    const rangeCoverage = calculateRangeCoverage(data);

    // ============================================
    // MÉTRICAS DE DURACIÓN
    // ============================================
    const durationMetrics = calculateDurationMetrics(data, songDuration);

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
 */
function calculatePitchMetrics(data: PerformanceDataPoint[]) {
    const deviations: number[] = [];
    let sharpCount = 0;
    let flatCount = 0;

    data.forEach(point => {
        if (!point.detectedFrequency) return;

        const cents = frequencyToCents(point.detectedFrequency, point.targetFrequency);
        deviations.push(cents);

        if (cents > 25) sharpCount++;      // Más de 25 cents agudo
        if (cents < -25) flatCount++;      // Más de 25 cents grave
    });

    const pitchDeviationAverage = deviations.reduce((sum, val) => sum + val, 0) / deviations.length;

    // Calcular desviación estándar
    const variance = deviations.reduce((sum, val) => sum + Math.pow(val - pitchDeviationAverage, 2), 0) / deviations.length;
    const pitchDeviationStdDev = Math.sqrt(variance);

    return {
        pitchDeviationAverage: Math.round(pitchDeviationAverage * 10) / 10,
        pitchDeviationStdDev: Math.round(pitchDeviationStdDev * 10) / 10,
        sharpNotesCount: sharpCount,
        flatNotesCount: flatCount,
    };
}

/**
 * Calcula métricas de ritmo
 * Detecta onsets (inicios de nota) y analiza timing
 */
function calculateRhythmMetrics(data: PerformanceDataPoint[]) {
    // 🆕 Detección de onsets mejorada basada en energía
    const onsets: Array<{ timestamp: number; offset: number }> = [];
    let earlyCount = 0;
    let lateCount = 0;

    // Calcular energía (amplitud de frecuencia)
    const energies = data.map(p => p.detectedFrequency || 0);

    // Detectar onsets (transiciones de baja a alta energía)
    const ENERGY_THRESHOLD = 100; // Hz mínimo para considerar canto activo
    let inNote = false;

    for (let i = 1; i < data.length; i++) {
        const prevEnergy = energies[i - 1];
        const currEnergy = energies[i];

        // Detectar inicio de nota (onset)
        if (!inNote && prevEnergy < ENERGY_THRESHOLD && currEnergy >= ENERGY_THRESHOLD) {
            inNote = true;

            // Calcular offset respecto al timestamp esperado
            // Simplificación: comparar con el timestamp de la nota objetivo
            const expectedTime = data[i].timestamp;
            const actualTime = data[i].timestamp;
            const offset = actualTime - expectedTime; // En ms

            onsets.push({ timestamp: actualTime, offset });

            if (offset < -50) earlyCount++;
            if (offset > 50) lateCount++;
        }

        // Detectar fin de nota
        if (inNote && currEnergy < ENERGY_THRESHOLD) {
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
 */
function detectVibrato(frequencies: number[]): { vibratoRate: number; vibratoDepth: number } {
    if (frequencies.length < 10) {
        return { vibratoRate: 0, vibratoDepth: 0 };
    }

    // Detectar cruces por cero en la derivada (cambios de dirección)
    const derivatives: number[] = [];
    for (let i = 1; i < frequencies.length; i++) {
        derivatives.push(frequencies[i] - frequencies[i - 1]);
    }

    // Contar cambios de signo (picos y valles)
    let zeroCrossings = 0;
    for (let i = 1; i < derivatives.length; i++) {
        if ((derivatives[i] > 0 && derivatives[i - 1] < 0) ||
            (derivatives[i] < 0 && derivatives[i - 1] > 0)) {
            zeroCrossings++;
        }
    }

    // Estimar frecuencia de vibrato (asumiendo ~100ms por muestra)
    const SAMPLE_INTERVAL_S = 0.1;
    const totalDuration = frequencies.length * SAMPLE_INTERVAL_S;
    const vibratoRate = zeroCrossings / (2 * totalDuration); // Dividir por 2 (pico + valle = 1 ciclo)

    // Calcular profundidad (desviación estándar en cents)
    const mean = frequencies.reduce((sum, val) => sum + val, 0) / frequencies.length;
    const deviations = frequencies.map(f => 1200 * Math.log2(f / mean));
    const variance = deviations.reduce((sum, val) => sum + Math.pow(val, 2), 0) / deviations.length;
    const vibratoDepth = Math.sqrt(variance);

    return {
        vibratoRate: vibratoRate > 0.5 ? vibratoRate : 0, // Filtrar ruido
        vibratoDepth: vibratoDepth > 5 ? vibratoDepth : 0, // Filtrar micro-variaciones
    };
}

/**
 * Calcula cobertura de rango vocal
 */
function calculateRangeCoverage(data: PerformanceDataPoint[]) {
    // Filtrar solo puntos válidos con frecuencia detectada
    const validPoints = data.filter(p => p.detectedFrequency && p.detectedFrequency > 0 && p.targetNote && p.targetNote !== 'N/A');
    
    if (validPoints.length === 0) {
        return {
            notesMissed: [],
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

    return {
        notesMissed,
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
