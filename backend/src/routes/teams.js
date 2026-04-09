import { Router } from 'express';
import * as teamController from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = Router();

router.get('/', teamController.list);
router.get('/:id', teamController.getOne);

router.post('/', authenticate, requireAdmin, teamController.create);
router.patch('/:id', authenticate, requireAdmin, teamController.update);
router.put('/:id', authenticate, requireAdmin, teamController.update);
router.delete('/:id', authenticate, requireAdmin, teamController.remove);

export default router;
