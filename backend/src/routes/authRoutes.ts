import { Router } from 'express';
import { register, login,checkAuth } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check-auth', checkAuth);

export default router;