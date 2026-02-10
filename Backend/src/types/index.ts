// ============================================
// TIPOS GLOBALES DEL BACKEND
// ============================================

/**
 * Estructura de melodyData en el modelo Song
 * Formato estricto para permitir análisis de timing y visualización
 */
export interface MelodyData {
  bpm: number;
  key: string; // Ej: "C Major", "A Minor"
  notes: MelodyNote[];
}

export interface MelodyNote {
  start: number; // Timestamp en segundos desde el inicio
  end: number; // Timestamp en segundos
  note: string; // Notación científica: "C4", "A#5"
  frequency: number; // Frecuencia en Hz
}

/**
 * Datos capturados durante una performance (Frontend DSP)
 */
export interface PerformanceDataPoint {
  timestamp: number; // Milisegundos desde el inicio
  detectedFrequency: number | null; // Hz detectados por ml5.js
  targetFrequency: number; // Hz objetivo de la melodía
  targetNote: string; // Nota objetivo
}

/**
 * Feedback generado por el Sistema Experto
 */
export interface PerformanceFeedback {
  pitchAccuracy: {
    score: number; // 0-100
    avgDeviationCents: number; // Desviación promedio en cents
    inTunePercentage: number; // % de notas afinadas (± 25 cents)
  };
  stability: {
    score: number; // 0-100
    avgJitter: number; // Variación promedio en cents
    stableNotesPercentage: number;
  };
  timing: {
    score: number; // 0-100
    avgLatency: number; // Latencia promedio en ms
    onTimePercentage: number; // % de notas a tiempo (± 50ms)
  };
  recommendations: string[]; // Consejos textuales
}

/**
 * Telemetría completa de sesión para diagnóstico avanzado
 */
export interface SessionTelemetry {
  // Métricas de Afinación
  pitchDeviationAverage: number;        // Desviación promedio en cents (+ = agudo, - = grave)
  pitchDeviationStdDev: number;         // Desviación estándar de errores de pitch
  sharpNotesCount: number;              // Cantidad de notas cantadas muy agudas
  flatNotesCount: number;               // Cantidad de notas cantadas muy graves

  // Métricas de Ritmo
  rhythmicOffsetAverage: number;        // Offset promedio en ms (+ = tarde, - = temprano)
  earlyNotesCount: number;              // Notas que empezaron temprano
  lateNotesCount: number;               // Notas que empezaron tarde

  // Métricas de Estabilidad
  stabilityVariance: number;            // Varianza en Hz durante notas sostenidas
  vibratoRate: number;                  // Frecuencia del vibrato en Hz
  vibratoDepth: number;                 // Profundidad del vibrato en cents

  // Cobertura de Rango
  rangeCoverage: {
    notesMissed: string[];              // Notas que fallaron (ej: ["C5", "D5"])
    notesMissedHigh: number;            // Cantidad de notas agudas falladas (>= C4)
    notesMissedLow: number;             // Cantidad de notas graves falladas (< C4)
    notesAchieved: string[];            // Notas cantadas exitosamente
    lowestNote: string;                 // Nota más grave intentada
    highestNote: string;                // Nota más aguda intentada
    comfortableRange: [string, string]; // Rango con >80% de precisión
  };

  // Métricas de Duración
  totalDuration: number;                // Duración total de la sesión (segundos)
  activeSingingTime: number;            // Tiempo cantando activamente (segundos)
  silenceTime: number;                  // Tiempo en silencio (segundos)
}

/**
 * Diagnóstico vocal generado por el sistema experto
 */
export interface VocalDiagnosis {
  primaryIssue: string;                 // Problema principal detectado
  secondaryIssues: string[];            // Problemas adicionales
  diagnosis: string;                    // Explicación técnica detallada
  prescription: string[];               // Ejercicios específicos recomendados
  severity: 'mild' | 'moderate' | 'severe'; // Severidad del problema
  affectedRange: 'low' | 'mid' | 'high' | 'full'; // Rango vocal afectado
  allDiagnoses?: string[];              // Lista completa de diagnósticos detectados por Prolog
}


/**
 * Request body para crear una performance
 */
export interface CreatePerformanceRequest {
  songId: string;
  performanceData: PerformanceDataPoint[];
  duration: number;
}

/**
 * Response del análisis de performance
 */
export interface AnalyzePerformanceResponse {
  performanceId: string;
  score: number;
  feedback: PerformanceFeedback;
}
