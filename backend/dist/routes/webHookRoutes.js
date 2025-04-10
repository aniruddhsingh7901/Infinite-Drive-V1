"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhook_1 = require("../controllers/webhook");
const webhook_2 = require("../controllers/webhook");
const router = (0, express_1.Router)();
router.post('/blockcypher', webhook_1.handleBlockCypherWebhook);
router.get('/check', webhook_1.checkWebhookRegistration);
router.delete('/webhook/:webhookId', webhook_1.deleteWebhook);
router.post('/register-webhook', webhook_1.registerWebhook);
router.delete('/delete-all', webhook_1.deleteAllWebhooks);
router.post('/helius', webhook_2.handleHeliusWebhook);
exports.default = router;
//# sourceMappingURL=webHookRoutes.js.map