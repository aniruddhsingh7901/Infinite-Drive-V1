import { Router } from 'express';
import { register, login, checkAuth, changePassword } from '../controllers/authController';


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check-auth', checkAuth);
router.post('/change-password', changePassword);

export default router;