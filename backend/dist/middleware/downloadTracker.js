"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadTracker = void 0;
const models_1 = require("../models");
const downloadTracker = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await models_1.Order.findByPk(orderId);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (order.status === 'completed') {
            res.status(403).json({ message: 'Download link has expired' });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.downloadTracker = downloadTracker;
//# sourceMappingURL=downloadTracker.js.map