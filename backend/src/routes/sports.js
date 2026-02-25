import { Router } from 'express';
import * as sportController from '../controllers/sportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', sportController.list);
router.get('/:id', sportController.getOne);

router.use(authenticate);
router.post('/', sportController.create);
router.patch('/:id', sportController.update);
router.put('/:id', sportController.update);
router.delete('/:id', sportController.remove);

export default router;
