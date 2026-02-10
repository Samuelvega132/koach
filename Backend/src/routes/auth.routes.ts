import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateVocalRange,
  getUserStats,
  getUserSessions,
} from '../controllers/auth.controller';
import { authenticateToken } from '../utils/authenticateToken';

// ============================================
// AUTH ROUTES
// ============================================

const router = Router();

/**
 * POST /auth/register
 * Registra un nuevo usuario
 * Body: { email, password, firstName, lastName }
 */
router.post('/register', register);

/**
 * POST /auth/login
 * Autentica un usuario y genera tokens
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * POST /auth/logout
 * Cierra la sesión del usuario
 * Limpia la cookie de refresh token
 */
router.post('/logout', logout);

/**
 * GET /auth/me
 * Obtiene el perfil del usuario autenticado
 * Requiere: Authorization: Bearer <accessToken>
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * PATCH /auth/me/vocal-range
 * Guarda el resultado del VocalRangeWizard
 * Requiere: Authorization: Bearer <accessToken>
 * Body: { vocalRange: "C3 - G5", voiceType: "baritone" }
 */
router.patch('/me/vocal-range', authenticateToken, updateVocalRange);

/**
 * GET /auth/me/stats
 * Obtiene estadísticas del usuario (sesiones totales, mejor score, promedio)
 * Requiere: Authorization: Bearer <accessToken>
 */
router.get('/me/stats', authenticateToken, getUserStats);

/**
 * GET /auth/me/sessions
 * Obtiene historial de sesiones del usuario con paginación
 * Requiere: Authorization: Bearer <accessToken>
 * Query: ?limit=10&offset=0
 */
router.get('/me/sessions', authenticateToken, getUserSessions);

export default router;
