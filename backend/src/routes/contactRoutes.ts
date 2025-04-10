import { Router } from 'express';
import { sendContactEmail } from '../controllers/contactController';

const router = Router();

// Route for sending contact form emails
router.post('/', sendContactEmail);

export default router;
