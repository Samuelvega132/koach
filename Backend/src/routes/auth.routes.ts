import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
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

export default router;
