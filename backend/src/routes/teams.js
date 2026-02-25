import { Router } from 'express';
import * as teamController from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminSport, adminSportMatch } from '../middleware/roleAuth.js';

const router = Router();

router.get('/', teamController.list);
router.get('/:id', teamController.getOne);

router.post('/', authenticate, requireAdmin, requireAdminSport, adminSportMatch(), teamController.create);
router.patch('/:id', authenticate, requireAdmin, adminSportMatch(), teamController.update);
router.put('/:id', authenticate, requireAdmin, adminSportMatch(), teamController.update);
router.delete('/:id', authenticate, requireAdmin, teamController.remove);

export default router;
