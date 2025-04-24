import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { BlockchainService } from '../services/blockchainService';
import { Book, Order } from '../models';
import { CryptoService } from '../services/cryptoService';
import { DownloadController } from './downloadController';
import EmailService from '../services/emailService';
import { PaymentService } from '../services/paymentService';
import { orderStore } from '../services/orderStore';
import WebSocketService from '../services/websocketService';

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

interface PaymentVerificationResult {
    verified: boolean;
    status?: string;
    txHash?: string;
    amount?: number;
    confirmations?: number;
    timestamp?: number;
    explorerUrl?: string;
    message?: string;
    completedAt?: Date;
    downloadToken?: string;
}
const supportedBlockCypherCurrencies = ['BTC', 'LTC', 'DOGE','USDT'];
export class PaymentController {
    constructor(
        private cryptoService: CryptoService = new CryptoService(),
        private blockchain: BlockchainService = new BlockchainService(),
        private download: DownloadController = new DownloadController(),
        private email: typeof EmailService = EmailService,
        private payment: PaymentService = new PaymentService()
    ) { }

    async createPayment(req: Request, res: Response): Promise<void> {
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

            // If user is logged in, ensure userId is an integer
            let userId = null;
            if (req.user && req.user.id) {
                // Try to parse the user ID as an integer
                const parsedId = parseInt(req.user.id, 10);
                // Only use the parsed ID if it's a valid number
                if (!isNaN(parsedId)) {
                    userId = parsedId;
                }
            }

            const order = await Order.create({
                id: uuidv4(),
                userId: userId,
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
            } else {
                console.log(`Initializing verification for ${cryptocurrency} payment, address: ${payment_address}, order: ${order.id}`);
            }

            orderStore.setCurrentOrderId(order.id);
    
            const paymentData = await this.payment.createPayment(
                order.id, // orderId
                cryptoAmount,
                cryptocurrency
            );

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

        } catch (error) {
            console.error('Payment creation error:', error);
            res.status(500).json({
                success: false,
                error: 'Payment creation failed',
                details: error instanceof Error ? error.message : String(error)
            });
        }
    }

}

export default new PaymentController(
    new CryptoService(),
    new BlockchainService(),
    new DownloadController(),
    EmailService,
    new PaymentService()
);
