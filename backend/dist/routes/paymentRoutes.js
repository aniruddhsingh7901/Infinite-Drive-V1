"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = __importDefault(require("../controllers/paymentController"));
const paymentMiddleware_1 = __importDefault(require("../middleware/paymentMiddleware"));
const paymentService_1 = require("../services/paymentService"); // Fixed import
const blockchainService_1 = require("../services/blockchainService");
const blockchainService = new blockchainService_1.BlockchainService();
const router = (0, express_1.Router)();
const paymentService = new paymentService_1.PaymentService();
router.post('/create', paymentMiddleware_1.default, paymentController_1.default.createPayment.bind(paymentController_1.default));
// router.get('/check/:orderId', paymentAuth, PaymentController.checkPayment.bind(PaymentController));
router.get('/address/:currency', paymentMiddleware_1.default, async (req, res) => {
    try {
        const address = await paymentService.generatePaymentAddress(req.params.currency);
        res.json({ success: true, address });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: 'Invalid currency'
        });
    }
});
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map