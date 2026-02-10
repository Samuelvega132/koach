import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/auth.utils';

// ============================================
// EXTENDER REQUEST DE EXPRESS
// ============================================

/**
 * Extiende el objeto Request de Express para incluir el usuario autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================

/**
 * Middleware que verifica el JWT en el header Authorization
 * Protege rutas que requieren autenticación
 * 
 * Header esperado: Authorization: Bearer <token>
 * 
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Extraer el token del header Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  // Si no hay token, rechazar
  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de autenticación no proporcionado',
    });
    return;
  }

  // Verificar el token
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Token inválido o expirado',
    });
    return;
  }

  // Adjuntar el payload al request para uso posterior
  req.user = payload;
  next();
}

/**
 * Middleware opcional que verifica el token si existe
 * Útil para rutas que pueden funcionar con o sin autenticación
 * 
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export function optionalAuthentication(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  // Continuar sin importar si el token es válido o no
  next();
}
