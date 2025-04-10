"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const uuid_1 = require("uuid");
const blockchainService_1 = require("../services/blockchainService");
const models_1 = require("../models");
const cryptoService_1 = require("../services/cryptoService");
const downloadController_1 = require("./downloadController");
const emailService_1 = __importDefault(require("../services/emailService"));
const paymentService_1 = require("../services/paymentService");
const orderStore_1 = require("../services/orderStore");
const supportedBlockCypherCurrencies = ['BTC', 'LTC', 'DOGE', 'USDT'];
class PaymentController {
    constructor(cryptoService = new cryptoService_1.CryptoService(), blockchain = new blockchainService_1.BlockchainService(), download = new downloadController_1.DownloadController(), email = emailService_1.default, payment = new paymentService_1.PaymentService()) {
        this.cryptoService = cryptoService;
        this.blockchain = blockchain;
        this.download = download;
        this.email = email;
        this.payment = payment;
    }
    async createPayment(req, res) {
        try {
            const { email, cryptocurrency, amount, bookId, format } = req.body;
            console.log("🚀 ~ PaymentController ~ createPayment ~ req.body:", req.body);
            // Create payment and generate QR code
            const payment_address = await this.payment.generatePaymentAddress(cryptocurrency);
            console.log("🚀 ~ PaymentController ~ createPayment ~ payment_address:", payment_address);
            const cryptoAmounts = await this.cryptoService.getPrices(amount);
            console.log("🚀 ~ PaymentController ~ createPayment ~ cryptoAmounts:", cryptoAmounts);
            let cryptoAmount = cryptoAmounts[cryptocurrency];
            // Use the converted cryptocurrency amount from the crypto service
            console.log(`Conversion for ${cryptocurrency}: $${amount} USD = ${cryptoAmount} ${cryptocurrency}`);
            // No need to override the conversion, just use the properly converted amount
            const order = await models_1.Order.create({
                id: (0, uuid_1.v4)(),
                userId: req.user?.id || (0, uuid_1.v4)(),
                bookId,
                email,
                amount: cryptoAmount,
                format,
                payment_currency: cryptocurrency,
                payment_address: payment_address,
                status: 'pending',
                downloadLink: null,
                downloadToken: null,
                downloadExpiresAt: null
            });
            // Register webhook based on cryptocurrency
            if (supportedBlockCypherCurrencies.includes(cryptocurrency) || cryptocurrency.toUpperCase() === 'SOL') {
                await this.blockchain.registerWebhook(payment_address, cryptocurrency, order.id);
            }
            else {
                console.log(`Initializing verification for ${cryptocurrency} payment, address: ${payment_address}, order: ${order.id}`);
            }
            orderStore_1.orderStore.setCurrentOrderId(order.id);
            const paymentData = await this.payment.createPayment(order.id, // orderId
            cryptoAmount, cryptocurrency);
            // console.log("🚀 ~ PaymentController ~ createPayment ~ response:", response)
            res.status(201).json({
                success: true,
                orderId: order.id,
                paymentAddress: payment_address,
                amount: cryptoAmount.toString(),
                currency: cryptocurrency,
                qrCodeData: paymentData.qrCodeData,
                networkFee: paymentData.networkFee,
                waitTime: paymentData.waitTime,
                minConfirmations: paymentData.minConfirmations,
                explorerUrl: paymentData.explorerUrl,
                instructions: `Please send ${cryptoAmount} ${cryptocurrency} to the provided address`
            });
        }
        catch (error) {
            console.error('Payment creation error:', error);
            res.status(500).json({
                success: false,
                error: 'Payment creation failed',
                details: error instanceof Error ? error.message : String(error)
            });
        }
    }
}
exports.PaymentController = PaymentController;
exports.default = new PaymentController(new cryptoService_1.CryptoService(), new blockchainService_1.BlockchainService(), new downloadController_1.DownloadController(), emailService_1.default, new paymentService_1.PaymentService());
//# sourceMappingURL=paymentController.js.map