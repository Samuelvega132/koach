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
