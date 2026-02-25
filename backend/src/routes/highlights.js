import { Router } from 'express';
import * as highlightController from '../controllers/highlightController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminSport, adminSportMatch } from '../middleware/roleAuth.js';
import { uploadVideo } from '../middleware/upload.js';

const router = Router();

router.get('/', highlightController.list);
router.get('/:id', highlightController.getOne);

router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadVideo.single('video'),
  highlightController.create
);
router.patch('/:id', authenticate, requireAdmin, adminSportMatch(), highlightController.update);
router.put('/:id', authenticate, requireAdmin, adminSportMatch(), highlightController.update);
router.delete('/:id', authenticate, requireAdmin, highlightController.remove);

export default router;
