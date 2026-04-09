import { Router } from 'express';
import * as matchController from '../controllers/matchController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = Router();

router.get('/', matchController.list);
router.get('/:id', matchController.getOne);

router.post('/', authenticate, requireAdmin, matchController.create);
router.put('/:id/score', authenticate, requireAdmin, matchController.updateScore);
router.patch('/:id', authenticate, requireAdmin, matchController.update);
router.put('/:id', authenticate, requireAdmin, matchController.update);
router.delete('/:id', authenticate, requireAdmin, matchController.remove);

export default router;
