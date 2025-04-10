"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentAuth = void 0;
const paymentAuth = async (req, res, next) => {
    try {
        if (req.method === 'POST') {
            const { email, cryptocurrency, bookId } = req.body;
            if (!email || !cryptocurrency || !bookId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }
        }
        if (req.method === 'GET' && req.params.orderId) {
            if (!req.params.orderId.match(/^[a-zA-Z0-9-]+$/)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order ID format'
                });
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.paymentAuth = paymentAuth;
exports.default = exports.paymentAuth;
//# sourceMappingURL=paymentMiddleware.js.map