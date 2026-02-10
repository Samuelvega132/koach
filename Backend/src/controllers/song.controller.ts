import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { storageService } from '../services/storage.service';
import { validateSongInput } from '../utils/validation.utils';

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
      console.error('[SongController.getAll] Error:', error);
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
      console.error('[SongController.getById] Error:', error);
      return next(error);
    }
  }

  /**
   * POST /api/songs
   * Crear una nueva canción
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, artist, bpm, key, audioFilename, melodyData } = req.body;

      // Validación básica de campos requeridos
      if (!title || !artist || !bpm || !key || !audioFilename || !melodyData) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: title, artist, bpm, key, audioFilename, melodyData',
        });
      }

      // Validación profunda de todos los campos
      const validation = validateSongInput({ title, artist, bpm, key, audioFilename, melodyData });
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid song data',
          details: validation.errors,
        });
      }

      // Verificar que el archivo existe en Storage
      const fileExists = await storageService.fileExists(audioFilename);
      if (!fileExists) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Audio file '${audioFilename}' not found in storage. Please upload the file first.`,
        });
      }

      // Generar URL pública desde Supabase Storage
      const audioUrl = storageService.getPublicUrl(audioFilename);

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
      console.error('[SongController.create] Error:', error);
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
    } catch (error) {
      console.error('[SongController.delete] Error:', error);
      
      // Manejar error de Prisma cuando el registro no existe
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Song not found',
        });
      }
      
      return next(error);
    }
  }
}
