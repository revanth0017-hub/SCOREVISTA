import { Router } from 'express';
import * as playersController from '../controllers/playersController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = Router();

// Public endpoints
router.get('/', playersController.list);
router.get('/:id', playersController.getOne);
router.get('/leaderboard/:sport', playersController.getLeaderboard);

// Admin endpoints
router.post('/', authenticate, requireAdmin, playersController.create);
router.patch('/:id', authenticate, requireAdmin, playersController.update);
router.put('/:id', authenticate, requireAdmin, playersController.update);
router.delete('/:id', authenticate, requireAdmin, playersController.remove);

// Stats endpoints
router.post('/:id/reset-stats', authenticate, requireAdmin, playersController.resetStats);
router.post('/bulk-update-stats', authenticate, requireAdmin, playersController.bulkUpdateStats);

export default router;
