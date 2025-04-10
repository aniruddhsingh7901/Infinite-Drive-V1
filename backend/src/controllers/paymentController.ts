import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { BlockchainService } from '../services/blockchainService';
import { Book, Order } from '../models';
import { CryptoService } from '../services/cryptoService';
import { DownloadController } from './downloadController';
import EmailService from '../services/emailService';
import { PaymentService } from '../services/paymentService';
import { orderStore } from '../services/orderStore';

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

            const order = await Order.create({
                id: uuidv4(),
                userId: req.user?.id || null,
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

    // async checkPayment(req: Request<{ orderId: string }>, res: Response): Promise<void> {
    //     try {
    //         const order = await Order.findByPk(req.params.orderId);
    //         console.log("🚀 ~ PaymentController ~ checkPayment ~ order:", req.params.orderId);
    //         if (!order) {
    //             res.status(404).json({ success: false, error: 'Order not found' });
    //             return;
    //         }

    //         const verification = await this.blockchain.getPaymentByAddress(
    //             order.payment_address,
    //             order.payment_currency,
    //             order.id
    //         );

    //         if (verification.verified) {
    //             // Update order with transaction hash if available
    //             if (verification.txHash) {
    //                 await Order.update({ txHash: verification.txHash }, { where: { id: order.id } });
    //                 order.txHash = verification.txHash; // Update the local object as well
    //             }
                
    //             // For Solana payments, we'll let the webhook handle the completion
    //             // This prevents premature delivery of the book
    //             if (order.payment_currency.toUpperCase() === 'SOL') {
    //                 // Just update the status to confirming and let the webhook handle completion
    //                 await Order.update({ status: 'confirming' }, { where: { id: order.id } });
                    
    //                 res.json({
    //                     success: true,
    //                     status: 'confirming',
    //                     message: 'Payment detected, waiting for confirmation via webhook',
    //                     confirmations: verification.confirmations || 0,
    //                     explorerUrl: verification.explorerUrl,
    //                     txHash: verification.txHash
    //                 });
    //                 return;
    //             }
                
    //             // For other cryptocurrencies, proceed with the normal flow
    //             const downloadToken = await this.handleSuccessfulPayment(order);
    
    //             res.json({
    //                 success: true,
    //                 status: verification.status || 'completed',
    //                 downloadToken,
    //                 explorerUrl: verification.explorerUrl,
    //                 txHash: verification.txHash,
    //                 completedAt: verification.timestamp ? new Date(verification.timestamp) : new Date()
    //             });
    //             return;
    //         }

    //         res.json({
    //             success: true,
    //             status: verification.status || 'awaiting_payment',
    //             confirmations: verification.confirmations || 0,
    //             message: verification.message || 'Waiting for payment confirmation'
    //         });

    //     } catch (error) {
    //         console.error('Payment verification error:', error);
    //         res.status(500).json({
    //             success: false,
    //             error: 'Payment verification failed',
    //             details: error instanceof Error ? error.message : String(error)
    //         });
    //     }
    // }

    // private async handleSuccessfulPayment(order: Order): Promise<string> {
    //     try {
    //         // Extract the base book ID without any format suffix
    //         const baseBookId = order.bookId
    //         console.log("Looking up book with ID:", order.bookId);
            
    //         const book = await Book.findByPk(baseBookId);
    //         if (!book) throw new Error(`Book not found with ID: ${baseBookId} (original: ${order.bookId})`);
    //         if (!order) throw new Error('Order not found');

    //         // Generate download token
    //         const downloadTokenObj = await this.download.generateDownloadToken(order.id);
    //         const downloadToken = downloadTokenObj.get('token');

    //         // Get selected format from order
    //         const format = order.format.toLowerCase();

    //         // Generate format-specific download link
    //         const downloadLink = `${process.env.API_URL}/download/${downloadToken}?format=${format}`;

    //         console.log("🚀 ~ handleSuccessfulPayment ~ downloadLink:", downloadLink);
    //       //Update order
    //         await Order.update({
    //             // status: 'completed',
    //             downloadToken,
    //             downloadLink,
    //             // txHash: verification.txHash,
    //             completedAt: new Date( Date.now())
    //         }, {
    //             where: { id: order.id }
    //         });

    //         // Send email with format-specific link
    //         const emailBody = `
    //         Thank you for your purchase!
            
    //         Your download link (valid for 24 hours):
    //         ${format.toUpperCase()} Version: ${downloadLink}
            
    //         Transaction Hash: ${order.txHash}
            
    //         Note: This link can only be used once.
    //     `;

    //         await this.email.sendEmail(order.email, 'Your Book Download Link', emailBody);

    //         return downloadToken;

    //     } catch (error) {
    //         console.error('Error handling successful payment:', error);
    //         throw error;
    //     }
    // }
}

export default new PaymentController(
    new CryptoService(),
    new BlockchainService(),
    new DownloadController(),
    EmailService,
    new PaymentService()
);
