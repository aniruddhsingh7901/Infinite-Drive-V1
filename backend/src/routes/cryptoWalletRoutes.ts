import { Router } from 'express';
import { getCryptoWallets, updateCryptoWallet } from '../controllers/cryptoWalletController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Get all crypto wallets
router.get('/crypto-wallets', authenticate, getCryptoWallets);

// Update a crypto wallet
router.put('/crypto-wallets/:symbol', authenticate, updateCryptoWallet);

export default router;
