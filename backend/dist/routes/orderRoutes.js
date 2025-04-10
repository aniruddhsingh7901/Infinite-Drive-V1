"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
router.get('/check-status/:orderId', orderController_1.checkOrderStatus);
router.get('/orders/:orderId', orderController_1.getOrder);
router.get('/all-orders', orderController_1.getAllOrders);
router.put('/orders/:orderId', orderController_1.updateOrder);
router.delete('/orders/:orderId', orderController_1.deleteOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map