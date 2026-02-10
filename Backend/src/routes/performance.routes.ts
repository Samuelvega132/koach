import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { authenticateToken } from '../utils/authenticateToken';
import { Request, Response, NextFunction } from 'express';

// Middleware de autenticación opcional (no falla si no hay token)
const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    // Si hay token, intentar autenticar
    authenticateToken(req, res, next);
  } else {
    // Si no hay token, continuar sin usuario
    next();
  }
};

const router = Router();

// ============================================
// PERFORMANCE ROUTES
// ============================================
router.post('/', optionalAuth, PerformanceController.create);
router.get('/:id', PerformanceController.getById);
router.get('/song/:songId', PerformanceController.getBySong);

export default router;
