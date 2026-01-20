import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { ExpertSystem } from '../services/expert-system.service';

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

      // Validación
      if (!songId || !userName || !performanceData || !Array.isArray(performanceData)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: songId, userName, performanceData (array)',
        });
      }

      // Analizar performance con Sistema Experto
      const analysis = ExpertSystem.analyzePerformance(performanceData);

      // Crear sesión y log de performance
      const session = await prisma.session.create({
        data: {
          songId,
          userName,
          score: Math.round(analysis.score),
          feedback: JSON.stringify(analysis.feedback.recommendations),
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

      return res.status(201).json({
        sessionId: session.id,
        score: session.score,
        feedback: JSON.parse(session.feedback),
        analysis: {
          pitchAccuracy: analysis.feedback.pitchAccuracy,
          stability: analysis.feedback.stability,
          timing: analysis.feedback.timing,
        },
        song: session.song,
      });
    } catch (error: any) {
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
          song: true,
          performanceLog: true,
        },
      });

      if (!session) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Session not found',
        });
      }

      return res.json(session);
    } catch (error) {
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
      return next(error);
    }
  }
}
