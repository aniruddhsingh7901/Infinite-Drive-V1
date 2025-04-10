"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadController = void 0;
const models_1 = require("../models");
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
class DownloadController {
    async generateDownloadToken(orderId) {
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        return await models_1.DownloadToken.create({
            orderId,
            token,
            expiresAt
        });
    }
    async downloadBook(req, res) {
        try {
            const { token } = req.params;
            const { format } = req.query;
            if (!format || !['pdf', 'epub'].includes(format.toString().toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid format specified'
                });
            }
            const downloadToken = await models_1.DownloadToken.findOne({
                where: {
                    token,
                    isUsed: false,
                    expiresAt: {
                        [sequelize_1.Op.gt]: new Date()
                    }
                }
            });
            if (!downloadToken) {
                return res.status(404).json({
                    success: false,
                    error: 'Invalid or expired download token'
                });
            }
            const order = await models_1.Order.findByPk(downloadToken.orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }
            const book = await models_1.Book.findByPk(order.bookId);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    error: 'Book not found'
                });
            }
            const fileUrl = book.filePaths[format.toString().toLowerCase()];
            if (!fileUrl) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found'
                });
            }
            await downloadToken.update({ isUsed: true });
            res.redirect(fileUrl);
        }
        catch (error) {
            console.error('Download error:', error);
            res.status(500).json({
                success: false,
                error: 'Download failed'
            });
        }
    }
}
exports.DownloadController = DownloadController;
exports.default = new DownloadController();
//# sourceMappingURL=downloadController.js.map