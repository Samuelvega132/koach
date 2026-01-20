import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';

const router = Router();

// ============================================
// PERFORMANCE ROUTES
// ============================================
router.post('/', PerformanceController.create);
router.get('/:id', PerformanceController.getById);
router.get('/song/:songId', PerformanceController.getBySong);

export default router;
