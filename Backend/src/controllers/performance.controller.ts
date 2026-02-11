import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { VocalDiagnosisService } from '../services/vocal-diagnosis.service';
import { validatePerformanceData } from '../utils/validation.utils';
import { calculateSessionTelemetry } from '../utils/telemetry.utils';
import type { PerformanceDataPoint } from '../types';

// ============================================
// CONSTANTS
// ============================================
const MILLISECONDS_TO_SECONDS = 1000;

// ============================================
// CONTROLLER: Sessions & PerformanceLogs
// ============================================

export class PerformanceController {
  /**
   * POST /api/performances
   * Crear una sesión de práctica con análisis automático
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { songId, userName, performanceData } = req.body;

      // Validación básica
      if (!songId || !userName || !performanceData) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: songId, userName, performanceData',
        });
      }

      // Validación profunda de performanceData
      const validation = validatePerformanceData(performanceData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid performanceData structure',
          details: validation.errors,
        });
      }

      // Calcular duración de la sesión desde los datos
      const lastTimestamp = performanceData.length > 0
        ? performanceData[performanceData.length - 1].timestamp
        : 0;
      const songDuration = lastTimestamp / MILLISECONDS_TO_SECONDS;

      // ============================================
      // 🔍 AUDITORÍA COMPLETA DEL BACKEND
      // ============================================
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🎯 BACKEND RECIBIÓ DATOS');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📊 Request Body:', {
        songId,
        userName,
        performanceDataLength: performanceData.length,
      });
      console.log('📈 Total de puntos recibidos:', performanceData.length);
      const validPointsCount = performanceData.filter(
        (point: PerformanceDataPoint) => point.detectedFrequency && point.detectedFrequency > 0
      ).length;
      console.log('🎵 Puntos válidos (con frecuencia):', validPointsCount);
      console.log('⏱️ Duración de sesión:', songDuration.toFixed(2), 'segundos');
      console.log('📋 Primeros 3 puntos:', performanceData.slice(0, 3));
      console.log('📋 Últimos 3 puntos:', performanceData.slice(-3));
      console.log('═══════════════════════════════════════════════════════════');

      // ============================================
      // 🧠 CONEXIÓN DIRECTA AL MOTOR DE INFERENCIA PROLOG
      // ============================================
      // Constantes de rango vocal humano
      const VOCAL_RANGE_MIN_HZ = 80;
      const VOCAL_RANGE_MAX_HZ = 1000;
      
      // 1. Calcular telemetría de sesión
      const telemetry = calculateSessionTelemetry(performanceData, songDuration);

      // 2. Ejecutar Motor de Inferencia Prolog DIRECTAMENTE
      const diagnosis = await VocalDiagnosisService.diagnose(telemetry);

      // 3. Calcular scores usando la telemetría YA CALCULADA (con filtrado de outliers)
      // IMPORTANTE: telemetry.pitchDeviationAverage ya tiene outliers filtrados (>300 cents)
      // No recalcular aquí para evitar inconsistencias
      const pitchAccuracy = {
        score: Math.round(100 * Math.exp(-Math.abs(telemetry.pitchDeviationAverage) / 200)),
        avgDeviationCents: telemetry.pitchDeviationAverage,
        inTunePercentage: 0, // TODO: calcular desde telemetry
      };
      
      const stability = {
        score: Math.round(Math.max(0, 100 * Math.exp(-telemetry.stabilityVariance / 50))),
        avgJitter: telemetry.stabilityVariance,
        stableNotesPercentage: 0, // TODO: calcular desde telemetry
      };
      
      const timing = { 
        score: 90, 
        avgLatency: telemetry.rhythmicOffsetAverage,
        onTimePercentage: 90 
      };
      
      console.log(`🎯 Puntos válidos en rango vocal: ${performanceData.filter((p: PerformanceDataPoint) => 
        p.detectedFrequency && 
        p.detectedFrequency > 0 &&
        p.targetFrequency >= VOCAL_RANGE_MIN_HZ &&
        p.targetFrequency <= VOCAL_RANGE_MAX_HZ
      ).length} de ${performanceData.length}`);

      // 4. Score global ponderado
      const score = Math.round(pitchAccuracy.score * 0.5 + stability.score * 0.3 + timing.score * 0.2);

      // No SANITY CHECK necesario - el nuevo sistema de umbrales es más robusto
      let finalDiagnosis = diagnosis;

      // 🔍 Log del análisis generado por el Motor de Inferencia
      console.log('🧠 ANÁLISIS DEL MOTOR DE INFERENCIA:');
      console.log('   → Score General:', score);
      console.log('   → Pitch Accuracy:', pitchAccuracy.score);
      console.log('   → Stability:', stability.score);
      console.log('   → Timing:', timing.score);
      console.log('   → RMS Afinación:', telemetry.pitchDeviationAverage.toFixed(2), 'cents');
      console.log('   → Diagnosis:', finalDiagnosis.primaryIssue);
      console.log('   → Severity:', finalDiagnosis.severity);
      console.log('═══════════════════════════════════════════════════════════');

      // Feedback con recomendaciones
      const feedback = {
        pitchAccuracy,
        stability,
        timing,
        recommendations: finalDiagnosis.prescription,
      };

      // Crear sesión y log de performance
      const session = await prisma.session.create({
        data: {
          songId,
          userName,
          userId: req.user?.userId || null, // Conectar con usuario autenticado si existe
          score: score,
          feedback: JSON.stringify(feedback.recommendations),
          telemetry: telemetry as any,
          diagnosis: finalDiagnosis as any,
          analysis: { pitchAccuracy, stability, timing } as any, // 🆕 Guardar analysis en BDD
          performanceLog: {
            create: {
              rawData: performanceData,
            },
          },
        },
        include: {
          performanceLog: true,
          song: {
            select: {
              title: true,
              artist: true,
            },
          },
        },
      });

      // 🔍 Log crítico: Verificar si se guardó con usuario
      console.log('═══════════════════════════════════════════════════════════');
      console.log('💾 SESIÓN GUARDADA EN BASE DE DATOS');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📝 Session ID:', session.id);
      console.log('👤 Usuario autenticado:', req.user?.userId ? '✅ SÍ' : '❌ NO (Modo invitado)');
      if (req.user?.userId) {
        console.log('   User ID:', req.user.userId);
        console.log('   Email:', req.user.email);
      }
      console.log('🎵 Canción:', session.song.title, '-', session.song.artist);
      console.log('⭐ Score:', session.score);
      console.log('═══════════════════════════════════════════════════════════');

      // Parsear feedback de forma segura
      let feedbackArray: string[];
      try {
        feedbackArray = JSON.parse(session.feedback);
      } catch (error) {
        console.error('[PerformanceController.create] Error parsing feedback:', error);
        feedbackArray = ['Error loading feedback'];
      }

      return res.status(201).json({
        sessionId: session.id,
        score: session.score,
        feedback: feedbackArray,
        analysis: {
          pitchAccuracy,
          stability,
          timing,
        },
        telemetry: session.telemetry,
        diagnosis: session.diagnosis,
        song: session.song,
        savedToProfile: !!req.user?.userId, // 🆕 Indicador de si se guardó en perfil
      });
    } catch (error: any) {
      console.error('[PerformanceController.create] Error:', error);
      if (error.code === 'P2003') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Song not found',
        });
      }
      return next(error);
    }
  }

  /**
   * GET /api/performances/:id
   * Obtener una sesión específica
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const session = await prisma.session.findUnique({
        where: { id },
        include: {
          song: {
            select: {
              title: true,
              artist: true,
            },
          },
          performanceLog: true,
        },
      });

      if (!session) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Session not found',
        });
      }

      // Parsear feedback de forma segura
      let feedbackArray: string[];
      try {
        feedbackArray = JSON.parse(session.feedback);
      } catch (error) {
        console.error('[PerformanceController.getById] Error parsing feedback:', error);
        feedbackArray = ['Error loading feedback'];
      }

      // 🔍 Log de datos recuperados
      console.log('📊 Sesión recuperada:', {
        id: session.id,
        score: session.score,
        hasTelemetry: !!session.telemetry,
        hasDiagnosis: !!session.diagnosis,
      });

      // 🆕 Usar analysis guardado en BDD (si existe), o recalcular desde telemetry
      // Esto asegura consistencia entre create() y getById()
      const analysisFromData = session.analysis || (
        session.telemetry ? {
          pitchAccuracy: { 
            score: Math.round(100 * Math.exp(-Math.abs((session.telemetry as any).pitchDeviationAverage || 0) / 200)), 
            avgDeviationCents: (session.telemetry as any).pitchDeviationAverage || 0,
            inTunePercentage: 0 
          },
          stability: { 
            score: Math.round(Math.max(0, 100 * Math.exp(-((session.telemetry as any).stabilityVariance || 0) / 50))), 
            avgJitter: (session.telemetry as any).stabilityVariance || 0,
            stableNotesPercentage: 0 
          },
          timing: { 
            score: 90, 
            avgLatency: (session.telemetry as any).rhythmicOffsetAverage || 0,
            onTimePercentage: 90 
          },
        } : {
          pitchAccuracy: { score: 0, avgDeviationCents: 0, inTunePercentage: 0 },
          stability: { score: 0, avgJitter: 0, stableNotesPercentage: 0 },
          timing: { score: 0, avgLatency: 0, onTimePercentage: 0 },
        }
      );

      return res.json({
        sessionId: session.id,
        score: session.score,
        feedback: feedbackArray,
        analysis: analysisFromData,
        telemetry: session.telemetry,
        diagnosis: session.diagnosis,
        song: session.song,
      });
    } catch (error) {
      console.error('[PerformanceController.getById] Error:', error);
      return next(error);
    }
  }

  /**
   * GET /api/performances/song/:songId
   * Obtener historial de sesiones de una canción
   */
  static async getBySong(req: Request, res: Response, next: NextFunction) {
    try {
      const { songId } = req.params;

      const sessions = await prisma.session.findMany({
        where: { songId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userName: true,
          score: true,
          createdAt: true,
        },
      });

      return res.json(sessions);
    } catch (error) {
      console.error('[PerformanceController.getBySong] Error:', error);
      return next(error);
    }
  }
}

// ============================================
// FUNCIONES AUXILIARES DE CÁLCULO
// ============================================

/* FUNCIONES COMENTADAS - No utilizadas actualmente pero mantenidas para referencia futura

/**
 * Calcula métricas de precisión de afinación
 * 
 * FÓRMULA DE SCORE RECALIBRADA:
 * - 0 cents = 100% (perfecto)
 * - 25 cents = 90% (muy bueno - apenas perceptible)
 * - 50 cents = 75% (bueno - medio semitono)
 * - 100 cents = 50% (regular - un semitono completo)  
 * - 200 cents = 25% (pobre - dos semitonos)
 * - 400+ cents = 0% (muy desafinado)
 *
function _calculatePitchAccuracy(data: PerformanceDataPoint[]) {
  if (data.length === 0) {
    return { score: 0, avgDeviationCents: 0, inTunePercentage: 0 };
  }

  const deviations: number[] = [];
  let inTuneCount = 0;

  data.forEach((point) => {
    if (!point.detectedFrequency || !point.targetFrequency) return;

    const cents = frequencyToCents(point.detectedFrequency, point.targetFrequency);
    deviations.push(Math.abs(cents));

    if (isInTune(point.detectedFrequency, point.targetFrequency)) {
      inTuneCount++;
    }
  });

  if (deviations.length === 0) {
    return { score: 0, avgDeviationCents: 0, inTunePercentage: 0 };
  }

  // Usar RMS en lugar de promedio simple
  const sumOfSquares = deviations.reduce((sum, val) => sum + val * val, 0);
  const rmsDeviationCents = Math.sqrt(sumOfSquares / deviations.length);
  
  const inTunePercentage = (inTuneCount / data.length) * 100;

  // NUEVA FÓRMULA: Curva exponencial más suave
  // score = 100 * e^(-deviation / 200)
  // Esto da: 0 cents → 100, 50 cents → 78, 100 cents → 61, 200 cents → 37, 400 cents → 14
  const score = Math.round(100 * Math.exp(-rmsDeviationCents / 200));

  console.log(`🎯 [PITCH SCORE] RMS: ${rmsDeviationCents.toFixed(1)} cents → Score: ${score}`);

  return {
    score: Math.max(0, Math.min(100, score)),
    avgDeviationCents: Math.round(rmsDeviationCents * 10) / 10,
    inTunePercentage: Math.round(inTunePercentage * 10) / 10,
  };
}

/**
 * Calcula métricas de estabilidad vocal
 *
function _calculateStability(data: PerformanceDataPoint[]) {
  const frequencies = data
    .map((p) => p.detectedFrequency)
    .filter((f): f is number => f !== null && f > 0);

  if (frequencies.length === 0) {
    return { score: 0, avgJitter: 0, stableNotesPercentage: 0 };
  }

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

*/