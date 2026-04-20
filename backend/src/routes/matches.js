import { Router } from 'express';
import * as matchController from '../controllers/matchController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = Router();

router.get('/', matchController.list);
router.get('/:id', matchController.getOne);
router.get('/:id/player-stats', matchController.getMatchPlayerStats);

router.post('/', authenticate, requireAdmin, matchController.create);
router.put('/:id/score', authenticate, requireAdmin, matchController.updateScore);

// Generic event-based scoring for all sports
router.post('/:id/event', authenticate, requireAdmin, matchController.processEvent);
router.post('/:id/event-undo', authenticate, requireAdmin, matchController.undoEvent);

// Cricket-specific endpoints (kept for backward compatibility)
router.post('/:id/cricket-ball', authenticate, requireAdmin, matchController.processCricketBall);
router.post('/:id/cricket-ball-undo', authenticate, requireAdmin, matchController.undoCricketBall);
router.post('/:id/cricket-start-innings', authenticate, requireAdmin, matchController.startCricketSecondInnings);

router.patch('/:id', authenticate, requireAdmin, matchController.update);
router.put('/:id', authenticate, requireAdmin, matchController.update);
router.delete('/:id', authenticate, requireAdmin, matchController.remove);

export default router;
