import express from 'express';
import { checkPurchase } from '../controllers/purchaseController';

const router = express.Router();

// Route to check if a user has purchased a book
router.get('/check-purchase', checkPurchase);

export default router;
