import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { ExpertSystem } from '../services/expert-system.service';
import { validatePerformanceData } from '../utils/validation.utils';
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

      // Analizar performance con Sistema Experto
      const analysis = ExpertSystem.analyzePerformance(performanceData, songDuration);

      // 🔍 Log del análisis generado
      console.log('🧠 ANÁLISIS DEL SISTEMA EXPERTO:');
      console.log('   → Score General:', analysis.score.toFixed(2));
      console.log('   → Pitch Accuracy:', analysis.feedback.pitchAccuracy.score.toFixed(2));
      console.log('   → Stability:', analysis.feedback.stability.score.toFixed(2));
      console.log('   → Timing:', analysis.feedback.timing.score.toFixed(2));
      console.log('   → Diagnosis:', analysis.diagnosis.primaryIssue);
      console.log('   → Severity:', analysis.diagnosis.severity);
      console.log('═══════════════════════════════════════════════════════════');

      // Preparar objeto de análisis para almacenamiento
      const analysisData = {
        pitchAccuracy: analysis.feedback.pitchAccuracy,
        stability: analysis.feedback.stability,
        timing: analysis.feedback.timing,
      };

      // Crear sesión y log de performance
      const session = await prisma.session.create({
        data: {
          songId,
          userName,
          score: Math.round(analysis.score),
          feedback: JSON.stringify(analysis.feedback.recommendations),
          telemetry: analysis.telemetry as any,
          diagnosis: analysis.diagnosis as any,
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
        analysis: analysisData,
        telemetry: session.telemetry,
        diagnosis: session.diagnosis,
        song: session.song,
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

      // Calcular analysis desde telemetry si existe
      const analysisFromData = session.telemetry ? {
        pitchAccuracy: { 
          score: Math.max(0, 100 - Math.abs((session.telemetry as any).pitchDeviationAverage || 0) * 2), 
          avgDeviationCents: (session.telemetry as any).pitchDeviationAverage || 0,
          inTunePercentage: 0 
        },
        stability: { 
          score: Math.max(0, 100 - (session.telemetry as any).stabilityVariance || 0), 
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
      };

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
