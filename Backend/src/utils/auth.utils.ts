import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';

// ============================================
// TIPOS
// ============================================
export interface JWTPayload {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// CONSTANTES DE SEGURIDAD
// ============================================
const SALT_ROUNDS = 12; // Número de rondas para bcrypt (más seguro que 10)
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 días

// ============================================
// PASSWORD HASHING
// ============================================

/**
 * Hashea una contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @returns Hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano con un hash
 * @param password - Contraseña en texto plano
 * @param hash - Hash almacenado
 * @returns true si coinciden, false si no
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// JWT TOKEN GENERATION
// ============================================

/**
 * Genera un par de tokens (access y refresh)
 * @param payload - Datos del usuario para incluir en el token
 * @returns Objeto con accessToken y refreshToken
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
}

/**
 * Verifica y decodifica un access token
 * @param token - Token JWT a verificar
 * @returns Payload decodificado o null si es inválido
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica y decodifica un refresh token
 * @param token - Token JWT a verificar
 * @returns Payload decodificado o null si es inválido
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// ============================================
// COOKIE OPTIONS
// ============================================

/**
 * Configuración de cookies HttpOnly para refresh tokens
 * Protege contra ataques XSS
 */
export const COOKIE_OPTIONS = {
  httpOnly: true, // No accesible desde JavaScript del cliente
  secure: config.NODE_ENV === 'production', // Solo HTTPS en producción
  sameSite: 'strict' as const, // Protección contra CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
  path: '/',
};
