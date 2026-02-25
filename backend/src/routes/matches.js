import { Router } from 'express';
import * as matchController from '../controllers/matchController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminSport, adminSportMatch } from '../middleware/roleAuth.js';

const router = Router();

router.get('/', matchController.list);
router.get('/:id', matchController.getOne);

router.post('/', authenticate, requireAdmin, requireAdminSport, adminSportMatch(), matchController.create);
router.patch('/:id/live', authenticate, requireAdmin, matchController.updateLiveScore);
router.patch('/:id', authenticate, requireAdmin, adminSportMatch(), matchController.update);
router.put('/:id', authenticate, requireAdmin, adminSportMatch(), matchController.update);
router.delete('/:id', authenticate, requireAdmin, matchController.remove);

export default router;
