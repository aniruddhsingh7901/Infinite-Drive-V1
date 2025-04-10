import { Router } from 'express';
import {
    handleBlockCypherWebhook,
    checkWebhookRegistration,
    deleteWebhook,
    registerWebhook,
    deleteAllWebhooks
} from '../controllers/webhook';
import { handleHeliusWebhook } from '../controllers/webhook';

const router = Router();

router.post('/blockcypher', handleBlockCypherWebhook);
router.get('/check', checkWebhookRegistration);
router.delete('/webhook/:webhookId', deleteWebhook);
router.post('/register-webhook', registerWebhook);
router.delete('/delete-all', deleteAllWebhooks);
router.post('/helius', handleHeliusWebhook);

export default router;
