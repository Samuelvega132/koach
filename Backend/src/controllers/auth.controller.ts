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
