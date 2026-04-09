import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/me', authenticate, authController.getMe);

// Admin routes
router.post('/admin/signup', authController.requestAdminOTP);
router.post('/admin/request-otp', authController.requestAdminOTP);
router.post('/admin/verify-otp', authController.verifyAdminOTP);
router.post('/admin/login', authController.loginAdmin);

// retirement endpoint for currently authenticated admin
router.post('/admin/retire', authenticate, authController.retireAdmin);

export default router;
