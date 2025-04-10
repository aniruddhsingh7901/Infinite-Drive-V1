"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHeliusWebhook = exports.deleteAllWebhooks = exports.registerWebhook = exports.deleteWebhook = exports.handleBlockCypherWebhook = exports.checkWebhookRegistration = exports.PaymentService = void 0;
const axios_1 = __importDefault(require("axios"));
// import { getRepository } from 'typeorm';
const models_1 = require("../models");
const app_1 = require("../app");
const blockchainService_1 = require("../services/blockchainService");
const downloadController_1 = require("../controllers/downloadController");
const emailService_1 = __importDefault(require("../services/emailService"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const emailService = emailService_1.default;
const downloadController = new downloadController_1.DownloadController();
class PaymentService {
    async getPaymentByOrderId(orderId) {
        return await models_1.Order.findOne({ where: { id: orderId } });
    }
    async updatePaymentStatus(orderId, status, txHash, confirmations) {
        try {
            const order = await models_1.Order.findOne({ where: { id: orderId } });
            console.log("🚀 ~ PaymentService ~ updatePaymentStatus ~ order:", order);
            if (!order) {
                console.error(`Order not found for ID: ${orderId}`);
                return;
            }
            // Update order status
            order.status = status;
            if (order.txHash == null) {
                order.txHash = txHash;
            }
            // For completed payments, generate download link and send email
            if (status === 'completed') {
                console.log(`Processing completed payment for order: ${orderId}`);
                try {
                    // Get the book details
                    const book = await models_1.Book.findByPk(order.bookId);
                    if (!book) {
                        console.error(`Book not found for order: ${orderId}, bookId: ${order.bookId}`);
                        return;
                    }
                    // Generate download token using DownloadController
                    const downloadController = new downloadController_1.DownloadController();
                    const downloadTokenObj = await downloadController.generateDownloadToken(order.id);
                    const downloadToken = downloadTokenObj.get('token');
                    // Generate format-specific download link
                    const format = order.format.toLowerCase();
                    const downloadLink = `${process.env.API_URL}/download/${downloadToken}?format=${format}`;
                    // Update order with download link
                    order.downloadToken = downloadToken;
                    order.downloadLink = downloadLink;
                    // Note: completedAt is tracked by the timestamps in the model
                    // Prepare download links based on format
                    const downloadLinks = {};
                    if (format === 'pdf') {
                        downloadLinks.pdf = downloadLink;
                    }
                    else if (format === 'epub') {
                        downloadLinks.epub = downloadLink;
                    }
                    // Send order confirmation email
                    const confirmationSent = await emailService.sendOrderConfirmation(order.email, {
                        orderId: order.id,
                        bookTitle: book.title,
                        amount: order.amount,
                        currency: order.payment_currency,
                        txHash: txHash
                    });
                    if (!confirmationSent) {
                        console.warn(`Failed to send order confirmation email for order: ${order.id}`);
                        // Continue with the process even if email fails
                    }
                    // Send download link email
                    const downloadLinkSent = await emailService.sendDownloadLink(order.email, downloadLinks, txHash, book.title, [] // No bonus items for now
                    );
                    if (!downloadLinkSent) {
                        console.warn(`Failed to send download link email for order: ${order.id}`);
                        // Continue with the process even if email fails
                    }
                    console.log(`Emails sent successfully for order: ${orderId}`);
                }
                catch (emailError) {
                    console.error(`Error sending emails for order: ${orderId}`, emailError);
                }
            }
            // Save the order
            await order.save();
            // Broadcast payment status update via WebSocket
            app_1.webSocketService.broadcast('paymentStatus', {
                orderId: order.id,
                status,
                txHash,
                downloadLink: order.downloadLink,
                confirmations
            });
            console.log(`Payment status updated for order: ${orderId}, status: ${status}`);
        }
        catch (error) {
            console.error(`Error updating payment status for order: ${orderId}`, error);
            throw error;
        }
    }
}
exports.PaymentService = PaymentService;
const paymentService = new PaymentService();
// const blockchainService = new BlockchainService();
const checkWebhookRegistration = async (req, res) => {
    const { address, currency, orderId } = req.query;
    console.log("🚀 ~ checkWebhookRegistration ~ req.query:", req.query);
    // If no parameters are provided, just return a success response
    // This is useful for checking if the webhook endpoint is accessible
    if (!address && !currency && !orderId) {
        res.status(200).json({
            success: true,
            message: 'Webhook endpoint is accessible'
        });
        return;
    }
    try {
        // If currency is not provided, we can't check webhook registration
        if (!currency) {
            res.status(400).json({
                success: false,
                message: 'Missing required parameter: currency'
            });
            return;
        }
        const webhooks = await blockchainService_1.blockchainService.listWebhooks(currency);
        console.log("🚀 ~ checkWebhookRegistration ~ webhooks:", webhooks);
        // If address and orderId are provided, check if the webhook is registered
        if (address && orderId) {
            const isRegistered = webhooks.some((webhook) => webhook.address === address &&
                webhook.url.includes(`orderId=${orderId}`));
            console.log("🚀 ~ checkWebhookRegistration ~ isRegistered:", isRegistered);
            res.status(200).json({
                success: true,
                isRegistered
            });
        }
        else {
            // Just return the list of webhooks
            res.status(200).json({
                success: true,
                webhooks
            });
        }
    }
    catch (error) {
        console.error('Error checking webhook registration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check webhook registration',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.checkWebhookRegistration = checkWebhookRegistration;
const handleBlockCypherWebhook = async (req, res) => {
    try {
        console.log('Received webhook payload');
        JSON.stringify(req.body, null, 2);
        const { hash, confirmations } = req.body;
        const { orderId } = req.query;
        console.log(hash, confirmations, "---------------");
        if (!hash || !orderId) {
            res.status(400).json({ message: 'Missing hash or orderId' });
            return;
        }
        const order = await paymentService.getPaymentByOrderId(orderId);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        // Get required confirmations from config
        const currency = order.payment_currency?.toUpperCase() || 'BTC';
        // const requiredConfirmations = blockchainService.config[currency]?.minConfirmations || 3;
        // Start monitoring if this is the first confirmation
        // Update payment status
        if (confirmations >= 1) {
            await paymentService.updatePaymentStatus(orderId, 'completed', hash);
            stopConfirmationTracking(hash);
        }
        else {
            startConfirmationTracking(hash, orderId, currency);
            await paymentService.updatePaymentStatus(orderId, 'confirming', hash, confirmations);
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.handleBlockCypherWebhook = handleBlockCypherWebhook;
// Add these new functions to track confirmations
const confirmationTrackers = new Map();
function startConfirmationTracking(txHash, orderId, currency) {
    if (confirmationTrackers.has(txHash)) {
        return;
    }
    const CHECK_INTERVAL = 200000; // 2 minutes
    const MAX_CHECKS = 60; // 20 minutes total
    let checkCount = 0;
    const timer = setInterval(async () => {
        try {
            checkCount++;
            // Check transaction status
            const response = await axios_1.default.get(`https://api.blockcypher.com/v1/${currency.toLowerCase()}/main/txs/${txHash}?token=${process.env.BLOCKCYPHER_API_TOKEN}`);
            console.log(response.data, "response from confirmation tracking");
            const { confirmations } = response.data;
            const requiredConfirmations = blockchainService_1.blockchainService.config[currency]?.minConfirmations || 3;
            console.log(`Transaction ${txHash} has ${confirmations}/${requiredConfirmations} confirmations`);
            if (confirmations >= 1) {
                await paymentService.updatePaymentStatus(orderId, 'completed', txHash);
            }
            else {
                stopConfirmationTracking(txHash);
                await paymentService.updatePaymentStatus(orderId, 'confirming', txHash, confirmations);
            }
            // Stop checking after MAX_CHECKS
            if (checkCount >= MAX_CHECKS) {
                console.log(`Stopping checks for ${txHash} after ${MAX_CHECKS} attempts`);
                stopConfirmationTracking(txHash);
            }
        }
        catch (error) {
            console.error(`Error checking transaction ${txHash}:`, error);
            if (checkCount >= MAX_CHECKS) {
                stopConfirmationTracking(txHash);
            }
        }
    }, CHECK_INTERVAL);
    confirmationTrackers.set(txHash, timer);
}
function stopConfirmationTracking(txHash) {
    const timer = confirmationTrackers.get(txHash);
    if (timer) {
        clearInterval(timer);
        confirmationTrackers.delete(txHash);
    }
}
const deleteWebhook = async (req, res) => {
    try {
        const { webhookId } = req.params;
        const { currency } = req.query;
        if (!webhookId) {
            res.status(400).json({ message: 'Missing required parameter: webhookId' });
            return;
        }
        if (!currency) {
            res.status(400).json({ message: 'Missing required parameter: currency' });
            return;
        }
        await blockchainService_1.blockchainService.deleteWebhook(webhookId, currency);
        res.status(200).json({ message: 'Webhook deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting webhook:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteWebhook = deleteWebhook;
const registerWebhook = async (req, res) => {
    try {
        const { address, currency, orderId } = req.body;
        console.log("🚀 ~ registerWebhook ~ req.body:", req.body);
        if (!address || !currency || !orderId) {
            res.status(400).json({ message: 'Missing required parameters: address, currency, or orderId' });
            return;
        }
        await blockchainService_1.blockchainService.registerWebhook(address, currency, orderId);
        res.status(200).json({ message: 'Webhook registered successfully' });
    }
    catch (error) {
        console.error('Error registering webhook:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.registerWebhook = registerWebhook;
const deleteAllWebhooks = async (req, res) => {
    try {
        const { currency } = req.query;
        console.log("🚀 ~ deleteAllWebhooks ~ req.query:", req.query);
        if (!currency) {
            res.status(400).json({ message: 'Missing required parameter: currency' });
            return;
        }
        await blockchainService_1.blockchainService.deleteAllWebhooks(currency);
        res.status(200).json({ message: 'All webhooks deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting all webhooks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteAllWebhooks = deleteAllWebhooks;
const handleHeliusWebhook = async (req, res) => {
    try {
        const payload = req.body;
        console.log('Received Helius webhook payload:', payload);
        const transaction = Array.isArray(payload) ? payload[0] : payload;
        if (!transaction || !transaction.nativeTransfers?.[0]) {
            return res.json({
                success: false,
                message: 'Invalid transaction data'
            });
        }
        // Get the current active webhook
        const webhooks = await blockchainService_1.blockchainService.listHeliusWebhooks();
        const activeWebhook = webhooks[0]; // Since we delete previous webhooks, there should only be one
        if (!activeWebhook) {
            console.error('No active webhook found');
            return res.json({
                success: false,
                message: 'No active webhook found'
            });
        }
        // Extract orderId from webhook URL
        const webhookUrl = new URL(activeWebhook.webhookURL);
        const orderId = webhookUrl.searchParams.get('orderId');
        console.log('Processing webhook for order:', orderId);
        // Get the order
        if (!orderId) {
            console.error('Order ID is null or undefined');
            return res.status(400).json({ success: false, message: 'Invalid order ID' });
        }
        const order = await models_1.Order.findByPk(orderId);
        if (!order) {
            console.error(`Order not found for ID: ${orderId}`);
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        if (transaction.type === 'TRANSFER') {
            const nativeTransfer = transaction.nativeTransfers[0];
            const amountInSol = nativeTransfer.amount / 1e9;
            // Verify payment address matches
            if (nativeTransfer.toUserAccount !== order.payment_address) {
                return res.json({
                    success: false,
                    message: 'Transfer destination does not match order payment address'
                });
            }
            try {
                // Update payment status
                await paymentService.updatePaymentStatus(orderId, 'completed', transaction.signature);
                console.log(`Payment completed for order ${orderId}`, {
                    txHash: transaction.signature,
                    amount: amountInSol
                });
                // Delete the webhook after successful payment
                await blockchainService_1.blockchainService.deleteHeliusWebhook(activeWebhook.webhookID);
                return res.json({
                    success: true,
                    message: 'Payment verified and processed',
                    data: {
                        orderId,
                        txHash: transaction.signature,
                        amount: amountInSol,
                        timestamp: transaction.timestamp
                    }
                });
            }
            catch (updateError) {
                console.error('Error updating payment status:', updateError);
                throw updateError;
            }
        }
        res.json({
            success: false,
            message: 'No matching transfer found',
            type: transaction.type
        });
    }
    catch (error) {
        console.error('Error processing Helius webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.handleHeliusWebhook = handleHeliusWebhook;
//# sourceMappingURL=webhook.js.map