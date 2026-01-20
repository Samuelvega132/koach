/**
 * ============================================
 * SISTEMA EXPERTO - Motor de Inferencia
 * ============================================
 * Implementación basada en reglas heurísticas musicales
 * NO utiliza Machine Learning, solo DSP y lógica experta
 */

import {
  PerformanceDataPoint,
  PerformanceFeedback,
} from '../types';
import {
  frequencyToCents,
  isInTune,
  calculateJitter,
  calculateStabilityPercentage,
} from '../utils/dsp.utils';

/**
 * Motor de inferencia principal
 * Recibe el log de la performance y ejecuta reglas de análisis
 */
export class ExpertSystem {
  /**
   * Analiza una performance completa y genera feedback
   */
  static analyzePerformance(data: PerformanceDataPoint[]): {
    score: number;
    feedback: PerformanceFeedback;
  } {
    // Filtrar puntos con frecuencia detectada válida
    const validPoints = data.filter((p) => p.detectedFrequency && p.detectedFrequency > 0);

    if (validPoints.length === 0) {
      return {
        score: 0,
        feedback: this.getEmptyFeedback('No se detectó canto válido'),
      };
    }

    // ============================================
    // REGLA 1: AFINACIÓN (Pitch Accuracy)
    // ============================================
    const pitchAccuracy = this.analyzePitchAccuracy(validPoints);

    // ============================================
    // REGLA 2: ESTABILIDAD VOCAL (Stability)
    // ============================================
    const stability = this.analyzeStability(validPoints);

    // ============================================
    // REGLA 3: TIMING MÉTRICO
    // ============================================
    const timing = this.analyzeTiming(validPoints);

    // ============================================
    // CÁLCULO DE SCORE GLOBAL (Ponderado)
    // ============================================
    const score = this.calculateGlobalScore(
      pitchAccuracy.score,
      stability.score,
      timing.score
    );

    // ============================================
    // GENERACIÓN DE RECOMENDACIONES
    // ============================================
    const recommendations = this.generateRecommendations(
      pitchAccuracy,
      stability,
      timing
    );

    return {
      score,
      feedback: {
        pitchAccuracy,
        stability,
        timing,
        recommendations,
      },
    };
  }

  /**
   * Regla 1: Análisis de Afinación
   * Mide la precisión en cents respecto a la nota objetivo
   */
  private static analyzePitchAccuracy(data: PerformanceDataPoint[]) {
    const deviations: number[] = [];
    let inTuneCount = 0;

    data.forEach((point) => {
      if (!point.detectedFrequency) return;

      const cents = frequencyToCents(point.detectedFrequency, point.targetFrequency);
      deviations.push(Math.abs(cents));

      if (isInTune(point.detectedFrequency, point.targetFrequency)) {
        inTuneCount++;
      }
    });

    const avgDeviationCents =
      deviations.reduce((sum, val) => sum + val, 0) / deviations.length;
    const inTunePercentage = (inTuneCount / data.length) * 100;

    // Score: penaliza desviación promedio (0 cents = 100, 50+ cents = 0)
    const score = Math.max(0, 100 - avgDeviationCents * 2);

    return {
      score: Math.round(score),
      avgDeviationCents: Math.round(avgDeviationCents * 10) / 10,
      inTunePercentage: Math.round(inTunePercentage * 10) / 10,
    };
  }

  /**
   * Regla 2: Análisis de Estabilidad
   * Mide el jitter (variación) en la frecuencia detectada
   */
  private static analyzeStability(data: PerformanceDataPoint[]) {
    const frequencies = data
      .map((p) => p.detectedFrequency)
      .filter((f): f is number => f !== null && f > 0);

    const avgJitter = calculateJitter(frequencies);
    const stableNotesPercentage = calculateStabilityPercentage(frequencies);

    // Score: jitter < 5 cents = excelente, > 20 cents = pobre
    const score = Math.max(0, 100 - avgJitter * 5);

    return {
      score: Math.round(score),
      avgJitter: Math.round(avgJitter * 10) / 10,
      stableNotesPercentage: Math.round(stableNotesPercentage * 10) / 10,
    };
  }

  /**
   * Regla 3: Análisis de Timing
   * Mide la sincronización temporal con la melodía
   */
  private static analyzeTiming(_data: PerformanceDataPoint[]) {
    // Simplificado: mide si el usuario está cantando en los momentos esperados
    // En una implementación completa, compararíamos con ventanas de tiempo de las notas

    const avgLatency = 0; // Placeholder: requiere análisis más complejo con onset detection
    const onTimePercentage = 90; // Placeholder: requiere segmentación de notas

    const score = 90; // Placeholder

    return {
      score,
      avgLatency,
      onTimePercentage,
    };
  }

  /**
   * Calcula el score global ponderado
   * Pesos: Afinación 50%, Estabilidad 30%, Timing 20%
   */
  private static calculateGlobalScore(
    pitchScore: number,
    stabilityScore: number,
    timingScore: number
  ): number {
    return Math.round(pitchScore * 0.5 + stabilityScore * 0.3 + timingScore * 0.2);
  }

  /**
   * Genera recomendaciones textuales basadas en reglas
   */
  private static generateRecommendations(
    pitchAccuracy: { score: number; avgDeviationCents: number; inTunePercentage: number },
    stability: { score: number; avgJitter: number },
    timing: { score: number }
  ): string[] {
    const recommendations: string[] = [];

    // Reglas de afinación
    if (pitchAccuracy.score < 50) {
      recommendations.push('🎯 Trabaja en tu afinación. Intenta cantar más lento y escuchar la melodía.');
    } else if (pitchAccuracy.score < 75) {
      recommendations.push('🎵 Buena afinación, pero aún puedes mejorar. Practica con escalas.');
    } else {
      recommendations.push('⭐ ¡Excelente afinación! Tu oído es muy preciso.');
    }

    if (pitchAccuracy.avgDeviationCents > 30) {
      recommendations.push('📉 Tus notas están ligeramente desafinadas. Usa auriculares para escucharte mejor.');
    }

    // Reglas de estabilidad
    if (stability.score < 60) {
      recommendations.push('🎚️ Tu voz fluctúa demasiado. Respira profundo y sostén las notas con más control.');
    } else if (stability.score > 85) {
      recommendations.push('💎 ¡Estabilidad vocal excelente! Mantienes las notas con firmeza.');
    }

    if (stability.avgJitter > 15) {
      recommendations.push('🌊 Trabaja en sostener las notas sin vibrato excesivo.');
    }

    // Reglas de timing
    if (timing.score < 70) {
      recommendations.push('⏱️ Trabaja en tu timing. Usa un metrónomo para practicar.');
    }

    // Recomendación general
    if (pitchAccuracy.score > 80 && stability.score > 80) {
      recommendations.push('🏆 ¡Increíble performance! Estás listo para canciones más difíciles.');
    }

    return recommendations;
  }

  /**
   * Feedback vacío para casos sin datos
   */
  private static getEmptyFeedback(reason: string): PerformanceFeedback {
    return {
      pitchAccuracy: { score: 0, avgDeviationCents: 0, inTunePercentage: 0 },
      stability: { score: 0, avgJitter: 0, stableNotesPercentage: 0 },
      timing: { score: 0, avgLatency: 0, onTimePercentage: 0 },
      recommendations: [reason],
    };
  }
}
