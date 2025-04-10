"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const database_1 = __importDefault(require("../config/database"));
const blockchainService_1 = require("./blockchainService");
const models_1 = require("../models");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class PaymentService {
    constructor() {
        this.sequelize = database_1.default;
        this.blockchain = new blockchainService_1.BlockchainService(); // TODO: Import and initialize proper blockchain service
        this.supportedCurrencies = {
            USDT: {
                name: 'Tether TRC20',
                symbol: 'USDT',
                address: process.env.USDT_ADDRESS || '',
                decimals: 6,
                minConfirmations: 19,
                networkFee: '1 TRX',
                waitTime: '5-20 minutes',
                qrFormat: (address, amount) => {
                    // Try a different format specifically for Trust Wallet
                    // This format is more similar to other cryptocurrencies
                    return `tron:${address}?amount=${parseFloat(amount).toFixed(6)}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`;
                },
                explorerUrl: 'https://tronscan.org/#/transaction/',
                contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
            },
            BTC: {
                name: 'Bitcoin',
                symbol: 'BTC',
                address: process.env.BTC_ADDRESS || '',
                decimals: 8,
                minConfirmations: 3,
                networkFee: '0.0001 BTC',
                waitTime: '10-60 minutes',
                qrFormat: (address, amount) => `bitcoin:${address}?amount=${parseFloat(amount).toFixed(8)}`,
                explorerUrl: 'https://www.blockchain.com/btc/tx/'
            },
            LTC: {
                name: 'Litecoin',
                symbol: 'LTC',
                address: process.env.LTC_ADDRESS || '',
                decimals: 8,
                minConfirmations: 3,
                networkFee: '0.001 LTC',
                waitTime: '2-30 minutes',
                qrFormat: (address, amount) => `litecoin:${address}?amount=${parseFloat(amount).toFixed(8)}`,
                explorerUrl: 'https://blockchair.com/litecoin/transaction/'
            },
            DOGE: {
                name: 'Dogecoin',
                symbol: 'DOGE',
                address: process.env.DOGE_ADDRESS || '',
                decimals: 8,
                minConfirmations: 3,
                networkFee: '1 DOGE',
                waitTime: '10-30 minutes',
                qrFormat: (address, amount) => `dogecoin:${address}?amount=${parseFloat(amount).toFixed(8)}`,
                explorerUrl: 'https://dogechain.info/tx/'
            },
            TRX: {
                name: 'Tron',
                symbol: 'TRX',
                address: process.env.TRX_ADDRESS || '',
                decimals: 6,
                minConfirmations: 3,
                networkFee: '1 TRX',
                waitTime: '1-5 minutes',
                qrFormat: (address, amount) => {
                    // Use the exact amount without multiplication
                    return `tron://transfer?toAddress=${address}&amount=${parseFloat(amount)}`;
                },
                explorerUrl: 'https://tronscan.org/#/transaction/'
            },
            XMR: {
                name: 'Monero',
                symbol: 'XMR',
                address: process.env.XMR_ADDRESS || '',
                decimals: 12,
                minConfirmations: 10,
                networkFee: '0.0001 XMR',
                waitTime: '20-60 minutes',
                qrFormat: (address, amount) => {
                    return `monero:${address}?tx_amount=${parseFloat(amount).toFixed(12)}`;
                },
                explorerUrl: 'https://xmrchain.net/tx/'
            },
            SOL: {
                name: 'Solana',
                symbol: 'SOL',
                address: process.env.SOL_ADDRESS || '',
                decimals: 9,
                minConfirmations: 3,
                networkFee: '0.000005 SOL',
                waitTime: '1-5 minutes',
                qrFormat: (address, amount) => {
                    // According to Solana Pay spec: https://docs.solanapay.com/spec
                    // The amount should be in SOL, not lamports
                    // Format with fixed precision to ensure valid number format
                    return `solana:${address}?amount=${parseFloat(amount).toFixed(9)}`;
                },
                explorerUrl: 'https://explorer.solana.com/tx/'
            }
            // Ot
            // Other currencies follow the same pattern
        };
    }
    async verifyPayment(paymentAddress, expectedAmount, currency, orderId) {
        try {
            // Get transaction details from blockchain
            const verificationResult = await this.blockchain.getPaymentByAddress(paymentAddress, currency, orderId);
            if (!verificationResult.verified) {
                return verificationResult;
            }
            // If we have a verified transaction, check if the amount matches
            if (verificationResult.amount !== undefined && verificationResult.amount < expectedAmount) {
                return {
                    verified: false,
                    status: 'insufficient',
                    amount: verificationResult.amount,
                    message: 'Insufficient payment amount',
                    txHash: verificationResult.txHash,
                    confirmations: verificationResult.confirmations,
                    explorerUrl: verificationResult.explorerUrl
                };
            }
            // Payment verified
            return {
                verified: true,
                status: 'completed',
                txHash: verificationResult.txHash,
                amount: verificationResult.amount,
                confirmations: verificationResult.confirmations,
                explorerUrl: verificationResult.explorerUrl,
                completedAt: new Date()
            };
        }
        catch (error) {
            console.error('Payment verification error:', error);
            return {
                verified: false,
                status: 'error',
                message: error instanceof Error ? error.message : 'Payment verification failed'
            };
        }
    }
    getMinConfirmations(currency) {
        const confirmations = {
            'BTC': 3,
            'LTC': 3,
            'DOGE': 3,
            'SOL': 3,
            'TRX': 3,
            'XMR': 10,
            'USDT': 19
        };
        return confirmations[currency] || 3;
    }
    formatAmount(amount, decimals) {
        try {
            const parsedAmount = parseFloat(amount.toString());
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                throw new Error('Invalid amount');
            }
            return parsedAmount;
        }
        catch (error) {
            console.error('Amount formatting error:', error);
            throw new Error('Invalid amount format');
        }
    }
    async getPaymentMethods() {
        return Object.entries(this.supportedCurrencies).map(([key, value]) => ({
            id: key,
            name: value.name,
            symbol: value.symbol,
            minConfirmations: value.minConfirmations,
            networkFee: value.networkFee,
            waitTime: value.waitTime
        }));
    }
    async generatePaymentAddress(currency) {
        console.log("🚀 ~ PaymentService ~ generatePaymentAddress ~ currency:", currency);
        // First try to get the wallet address from the database
        try {
            const wallet = await models_1.CryptoWallet.findOne({ where: { symbol: currency } });
            if (wallet && wallet.address) {
                console.log(`Using wallet address from database for ${currency}: ${wallet.address}`);
                return wallet.address;
            }
        }
        catch (error) {
            console.error(`Error fetching wallet address from database for ${currency}:`, error);
            // Continue to fallback to environment variables
        }
        // Fallback to environment variables
        const currencyConfig = this.supportedCurrencies[currency];
        console.log("🚀 ~ PaymentService ~ generatePaymentAddress ~ currencyConfig:", currencyConfig);
        if (!currencyConfig?.address) {
            throw new Error('Unsupported currency or missing address');
        }
        console.log(`Using wallet address from environment variables for ${currency}: ${currencyConfig.address}`);
        return currencyConfig.address;
    }
    async formatQRCode(currency, address, amount) {
        const currencyConfig = this.supportedCurrencies[currency];
        if (!currencyConfig) {
            throw new Error('Unsupported currency');
        }
        try {
            const formattedAmount = this.formatAmount(amount);
            const qrData = currencyConfig.qrFormat(address, formattedAmount.toString());
            console.log('Generated QR Data:', { currency, address, amount: formattedAmount, qrData });
            return qrData;
        }
        catch (error) {
            console.error('QR code formatting error:', error);
            throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async createPayment(orderId, amount, currency) {
        try {
            const paymentAddress = await this.generatePaymentAddress(currency);
            const formattedAmount = this.formatAmount(amount);
            // Use Sequelize's update method instead of raw query
            const [updatedOrders] = await this.sequelize.models.Order.update({
                payment_address: paymentAddress,
                payment_currency: currency,
                status: 'awaiting_payment',
                updated_at: new Date()
            }, {
                where: { id: orderId },
                returning: true
            });
            if (!updatedOrders) {
                throw new Error('Failed to update order');
            }
            // Get the updated order
            const order = await this.sequelize.models.Order.findByPk(orderId);
            if (!order) {
                throw new Error('Order not found after update');
            }
            const currencyConfig = this.supportedCurrencies[currency];
            // Generate QR code data
            const qrCodeData = await this.formatQRCode(currency, paymentAddress, formattedAmount);
            return {
                ...order.toJSON(),
                qrCodeData,
                networkFee: currencyConfig.networkFee,
                waitTime: currencyConfig.waitTime,
                explorerUrl: currencyConfig.explorerUrl,
                minConfirmations: currencyConfig.minConfirmations
            };
        }
        catch (error) {
            console.error('Payment creation error:', error);
            throw error;
        }
    }
    getExplorerUrl(currency, txHash) {
        if (!txHash)
            return undefined;
        return this.supportedCurrencies[currency]?.explorerUrl + txHash;
    }
}
exports.PaymentService = PaymentService;
exports.default = new PaymentService();
//# sourceMappingURL=paymentService.js.map