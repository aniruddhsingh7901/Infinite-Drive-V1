import { Router } from 'express';
import { register, login, checkAuth, forgotPassword, resetPassword, toggleOTP } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check-auth', checkAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/toggle-otp', authenticate, toggleOTP);

export default router;
