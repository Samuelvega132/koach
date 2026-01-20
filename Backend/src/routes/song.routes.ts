import { Router } from 'express';
import { SongController } from '../controllers/song.controller';

const router = Router();

// ============================================
// SONG ROUTES
// ============================================
router.get('/', SongController.getAll);
router.get('/:id', SongController.getById);
router.post('/', SongController.create);
router.delete('/:id', SongController.delete);

export default router;
