import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// ============================================
// CONTROLLER: Songs
// ============================================
// Maneja la lógica de petición/respuesta para canciones

export class SongController {
  /**
   * GET /api/songs
   * Listar todas las canciones (sin melodyData pesado)
   */
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const songs = await prisma.song.findMany({
        select: {
          id: true,
          title: true,
          artist: true,
          bpm: true,
          key: true,
          audioUrl: true,
          createdAt: true,
          // melodyData excluido intencionalmente
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(songs);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/songs/:id
   * Obtener una canción específica CON melodyData
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const song = await prisma.song.findUnique({
        where: { id },
      });

      if (!song) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Song not found',
        });
      }

      return res.json(song);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/songs
   * Crear una nueva canción
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, artist, bpm, key, audioUrl, melodyData } = req.body;

      // Validación básica
      if (!title || !artist || !bpm || !key || !audioUrl || !melodyData) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: title, artist, bpm, key, audioUrl, melodyData',
        });
      }

      const song = await prisma.song.create({
        data: {
          title,
          artist,
          bpm,
          key,
          audioUrl,
          melodyData,
        },
      });

      return res.status(201).json(song);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/songs/:id
   * Eliminar una canción
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.song.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Song not found',
        });
      }
      return next(error);
    }
  }
}
