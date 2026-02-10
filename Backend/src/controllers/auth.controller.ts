import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
  hashPassword,
  comparePassword,
  generateTokenPair,
  COOKIE_OPTIONS,
} from '../utils/auth.utils';
import { toUserDto } from '../utils/user.dto';
import {
  RegisterSchema,
  LoginSchema,
  RegisterInput,
  LoginInput,
} from '../utils/auth.validation';
import { ZodError } from 'zod';

// ============================================
// AUTH CONTROLLER
// ============================================

/**
 * POST /auth/register
 * Registra un nuevo usuario en el sistema
 * 
 * Body: { email, password, firstName, lastName }
 * Returns: { user, accessToken }
 * Cookie: refreshToken (HttpOnly)
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Validar datos de entrada con Zod
    const validatedData: RegisterInput = RegisterSchema.parse(req.body);

    // Verificar si el email ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      res.status(409).json({
        error: 'Conflict',
        message: 'El email ya está registrado',
      });
      return;
    }

    // Hashear la contraseña
    const passwordHash = await hashPassword(validatedData.password);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
    });

    // Generar tokens
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    // Establecer cookie con refresh token
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // Devolver usuario sanitizado y access token
    res.status(201).json({
      user: toUserDto(user),
      accessToken,
    });
  } catch (error) {
    // Manejar errores de validación de Zod
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Datos de registro inválidos',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    // Error interno del servidor
    console.error('[AUTH] Error en registro:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al registrar usuario',
    });
  }
}

/**
 * POST /auth/login
 * Autentica un usuario y genera tokens
 * 
 * Body: { email, password }
 * Returns: { user, accessToken }
 * Cookie: refreshToken (HttpOnly)
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // Validar datos de entrada con Zod
    const validatedData: LoginInput = LoginSchema.parse(req.body);

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Credenciales inválidas',
      });
      return;
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Credenciales inválidas',
      });
      return;
    }

    // Generar tokens
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    // Establecer cookie con refresh token
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // Devolver usuario sanitizado y access token
    res.status(200).json({
      user: toUserDto(user),
      accessToken,
    });
  } catch (error) {
    // Manejar errores de validación de Zod
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Datos de login inválidos',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    // Error interno del servidor
    console.error('[AUTH] Error en login:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al autenticar usuario',
    });
  }
}

/**
 * POST /auth/logout
 * Cierra la sesión del usuario eliminando la cookie de refresh token
 * 
 * Returns: { message }
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  // Limpiar la cookie de refresh token
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  res.status(200).json({
    message: 'Sesión cerrada exitosamente',
  });
}

/**
 * GET /auth/me
 * Devuelve el perfil del usuario autenticado
 * 
 * Headers: Authorization: Bearer <accessToken>
 * Returns: { user }
 */
export async function getCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // El middleware authenticateToken ya adjuntó req.user
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Usuario no autenticado',
      });
      return;
    }

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Devolver usuario sanitizado
    res.status(200).json({
      user: toUserDto(user),
    });
  } catch (error) {
    console.error('[AUTH] Error al obtener usuario actual:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al obtener perfil de usuario',
    });
  }
}

/**
 * PATCH /auth/me/vocal-range
 * Guarda el resultado del VocalRangeWizard en el perfil del usuario
 * 
 * Headers: Authorization: Bearer <accessToken>
 * Body: { 
 *   vocalRange: "C3 - G5", 
 *   voiceType: "baritone",
 *   lowestNote: "C3",
 *   highestNote: "G5",
 *   comfortableRange: ["E3", "E5"],
 *   vocalRangeSemitones: 29
 * }
 * Returns: { user }
 */
export async function updateVocalRange(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Verificar autenticación
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Usuario no autenticado',
      });
      return;
    }

    const { 
      vocalRange, 
      voiceType,
      lowestNote,
      highestNote,
      comfortableRange,
      vocalRangeSemitones
    } = req.body;

    // Validación básica - ahora acepta campos parciales
    if (!vocalRange && !voiceType && !lowestNote && !highestNote) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Se requiere al menos vocalRange, voiceType, lowestNote o highestNote',
      });
      return;
    }

    // Construir objeto de actualización solo con campos presentes
    const updateData: {
      vocalRange?: string;
      voiceType?: string;
      lowestNote?: string;
      highestNote?: string;
      comfortableRange?: [string, string];
      vocalRangeSemitones?: number;
    } = {};

    if (vocalRange) updateData.vocalRange = vocalRange;
    if (voiceType) updateData.voiceType = voiceType;
    if (lowestNote) updateData.lowestNote = lowestNote;
    if (highestNote) updateData.highestNote = highestNote;
    if (comfortableRange) updateData.comfortableRange = comfortableRange;
    if (vocalRangeSemitones !== undefined) updateData.vocalRangeSemitones = vocalRangeSemitones;

    // Actualizar perfil vocal
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
    });

    console.log(`✅ Vocal range actualizado para usuario ${req.user.userId}:`, updateData);

    // Devolver usuario sanitizado
    res.status(200).json({
      user: toUserDto(updatedUser),
    });
  } catch (error) {
    console.error('[AUTH] Error al actualizar vocal range:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al guardar rango vocal',
    });
  }
}

/**
 * GET /auth/me/stats
 * Obtiene estadísticas del usuario (sesiones, promedios, etc.)
 * 
 * Headers: Authorization: Bearer <accessToken>
 * Returns: { totalSessions, bestScore, averageScore, recentSessions }
 */
export async function getUserStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Usuario no autenticado',
      });
      return;
    }

    // Obtener todas las sesiones del usuario
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        score: true,
        createdAt: true,
        song: {
          select: {
            title: true,
            artist: true,
          },
        },
      },
    });

    // Calcular estadísticas
    const totalSessions = sessions.length;
    const bestScore = totalSessions > 0 ? Math.max(...sessions.map(s => s.score)) : 0;
    const averageScore = totalSessions > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions)
      : 0;

    res.status(200).json({
      totalSessions,
      bestScore,
      averageScore,
      recentSessions: sessions.slice(0, 5), // Últimas 5 sesiones
    });
  } catch (error) {
    console.error('[AUTH] Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al obtener estadísticas',
    });
  }
}

/**
 * GET /auth/me/sessions
 * Obtiene el historial de sesiones del usuario
 * 
 * Headers: Authorization: Bearer <accessToken>
 * Query: ?limit=10&offset=0
 * Returns: { sessions, total }
 */
export async function getUserSessions(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Usuario no autenticado',
      });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    // Obtener sesiones con paginación
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          score: true,
          createdAt: true,
          diagnosis: true,
          song: {
            select: {
              title: true,
              artist: true,
            },
          },
        },
      }),
      prisma.session.count({
        where: { userId: req.user.userId },
      }),
    ]);

    res.status(200).json({
      sessions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[AUTH] Error al obtener sesiones:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al obtener sesiones',
    });
  }
}
