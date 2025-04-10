import axios from 'axios';
import { Order } from '../models';
import { PaymentService } from '../controllers/webhook';

interface BlockchainConfig {
    apiUrl: string;
    apiKey: string;
    explorerUrl: string;
    decimals: number;
    minConfirmations: number;
    usdtContract?: string;
    webhookUrl?: string;
}

const paymentService = new PaymentService();
interface BlockchainConfigs {
    [key: string]: BlockchainConfig;
}



export class BlockchainService {
    private static instance: BlockchainService;
    constructor() { }
    public static getInstance(): BlockchainService {
        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }
        return BlockchainService.instance;
    }
    readonly config: BlockchainConfigs = {
        BTC: {
            apiUrl: 'https://api.blockcypher.com/v1/btc/main',
            apiKey: process.env.BLOCKCYPHER_API_TOKEN!,
            explorerUrl: 'https://www.blockchain.com/btc/tx/',
            decimals: 8,
            minConfirmations: 3,
            webhookUrl: `https://api.blockcypher.com/v1/btc/main/hooks?token=${process.env.BLOCKCYPHER_API_TOKEN!}`
        },
        LTC: {
            apiUrl: 'https://api.blockcypher.com/v1/ltc/main',
            apiKey: process.env.BLOCKCYPHER_API_TOKEN!,
            explorerUrl: 'https://blockchair.com/litecoin/transaction/',
            decimals: 8,
            minConfirmations: 3
        },
        DOGE: {
            apiUrl: 'https://api.blockcypher.com/v1/doge/main',
            apiKey: process.env.BLOCKCYPHER_API_TOKEN!,
            explorerUrl: 'https://dogechain.info/tx/',
            decimals: 8,
            minConfirmations: 3
        },
        SOL: {
            apiUrl: 'https://api.solscan.io',
            apiKey: process.env.HELIUS_API_KEY!,
            explorerUrl: 'https://solscan.io/tx/',
            decimals: 9,
            minConfirmations: 3
        },
        USDT: {
            apiUrl: 'https://api.trongrid.io',
            apiKey: process.env.TRON_API_KEY!,
            explorerUrl: 'https://tronscan.org/#/transaction/',
            decimals: 6,
            minConfirmations: 19,
            usdtContract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
        },
        TRX: {
            apiUrl: 'https://api.trongrid.io',
            apiKey: process.env.TRON_API_KEY!,
            explorerUrl: 'https://tronscan.org/#/transaction/',
            decimals: 6,
            minConfirmations: 3
        },
        XMR: {
            apiUrl: 'https://xmrchain.net/api',
            apiKey: '',
            explorerUrl: 'https://xmrchain.net/tx/',
            decimals: 12,
            minConfirmations: 10
        }
    };

    private currentOrderId: string | null = null;


    async deleteHeliusWebhook(webhookId: string): Promise<void> {
        const apiKey = process.env.HELIUS_API_KEY;
        if (!apiKey) throw new Error('Helius API key is missing');

        await axios.delete(`https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${apiKey}`);
    }

    async listHeliusWebhooks(): Promise<any[]> {
        const apiKey = process.env.HELIUS_API_KEY;
        if (!apiKey) throw new Error('Helius API key is missing');

        try {
            const response = await axios.get(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`);
            console.log("🚀 ~ BlockchainService ~ listHeliusWebhooks ~ response:", response.data)
            return response.data as any[];
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn('Helius API does not support listing webhooks or the endpoint is incorrect.');
                return []; // Return an empty list if the endpoint is not found
            }
            console.error('Error listing Helius webhooks:', error);
            throw error; // Re-throw other errors
        }
    }

    async deleteAllHeliusWebhooks(): Promise<void> {
        const apiKey = process.env.HELIUS_API_KEY;
        if (!apiKey) throw new Error('Helius API key is missing');

        const webhooks = await this.listHeliusWebhooks();
        for (const webhook of webhooks) {
            await this.deleteHeliusWebhook(webhook.webhookID);
            console.log(`Deleted webhook: ${webhook.webhookID}`);
        }
    }

    async registerWebhook(address: string, currency: string, orderId: string): Promise<void> {
        const config = this.config[currency.toUpperCase()];
        if (!config) throw new Error(`Unsupported currency: ${currency}`);

        this.currentOrderId = orderId;

        try {
            if (currency.toUpperCase() === 'USDT') {
                // Register TRON Grid webhook
                this.startTRC20TransactionPolling(address, orderId);
                console.log(`Started polling for USDT transactions for address: ${address}`);
            }
            else if(currency.toUpperCase() === 'SOL') {
                const apiKey = process.env.HELIUS_API_KEY;
                if (!apiKey) throw new Error('Helius API key is missing');

                const webhookData = {
                    accountAddresses: [address],
                    webhookURL: `http://138.197.21.102:5002/webhooks/helius?orderId=${orderId}`,
                    transactionTypes: ['TRANSFER'],
                };

                console.log("🚀 ~ BlockchainService ~ registerWebhook ~ Helius webhookData:", webhookData);

                try {
                    // Delete all existing webhooks before registering a new one
                    await this.deleteAllHeliusWebhooks();

                    const response = await axios.post(
                        `https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`,
                        webhookData,
                        {
                            headers: { 'Content-Type': 'application/json' },
                        }
                    );

                    console.log('Helius webhook registered successfully:', response.data);
                } catch (error) {
                    console.error(`Error registering SOL webhook:`, error);
                    throw error;
                }
            } else {
                // BlockCypher for other cryptocurrencies
                const webhookData = {
                    events: ['tx-confirmation', 'unconfirmed-tx'],
                    address,
                    confirmations: 1,
                    url: `http://138.197.21.102:5002/webhooks/blockcypher?orderId=${orderId}`,
                    token: config.apiKey,
                };

                console.log("🚀 ~ BlockchainService ~ registerWebhook ~ webhookData:", webhookData);

                await axios.post(`${config.apiUrl}/hooks`, webhookData);
                console.log(`Successfully registered ${currency} webhook for order: ${orderId}`);
            }
        } catch (error) {
            console.error(`Error registering ${currency} webhook:`, error);
        }
    }

    getCurrentOrderId(): string | null {
        return this.currentOrderId;
    }

    private async startTRC20TransactionPolling(address: string, orderId: string) {
        const POLLING_INTERVAL = 30000; // 30 seconds
        const MAX_ATTEMPTS = 60; // 30 minutes total
        let attempts = 0;

        const pollInterval = setInterval(async () => {
            try {
                attempts++;
                const transactions = await this.getTRC20Transactions(address);
                // console.log('TRC20 transactions:', transactions);
                if (transactions.length > 0) {
                    const latestTx = transactions[0];
                    console.log('Latest TRC20 transaction:', latestTx);
                    const isValidPayment = await this.validateTRC20Payment(latestTx, address, orderId);
                    console.log('isValidatedPayment:', isValidPayment);
                    if (isValidPayment) {
                        await paymentService.updatePaymentStatus(
                            orderId,
                            'completed',
                            latestTx.transaction_id
                        );
                        clearInterval(pollInterval);
                    }
                }

                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollInterval);
                    console.log(`Stopped polling for address ${address} after ${MAX_ATTEMPTS} attempts`);
                }
            } catch (error) {
                console.error('Error polling TRC20 transactions:', error);
                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollInterval);
                }
            }
        }, POLLING_INTERVAL);
    }

    private async getTRC20Transactions(address: string): Promise<any[]> {
        try {
            const response = await axios.get(
                `${this.config.USDT.apiUrl}/v1/accounts/${address}/transactions/trc20`, {
                params: {
                    limit: 10,
                    contract_address: this.config.USDT.usdtContract,
                    only_confirmed: true
                },
                headers: {
                    'TRON-PRO-API-KEY': process.env.TRON_API_KEY
                }
            });

            const data = response.data as { data: any[] };
            return data.data || [];
        } catch (error) {
            console.error('Error fetching TRC20 transactions:', error);
            return [];
        }
    }
    private async validateTRC20Payment(transaction: any, address: string, orderId: string): Promise<boolean> {
        try {
            const order = await Order.findOne({ where: { id: orderId } });
            if (!order) return false;

            // Validate transaction details
            const isCorrectToken = transaction.token_info?.address === this.config.USDT.usdtContract;
            const isCorrectAddress = transaction.to === address;
            const amount = parseInt(transaction.value) / Math.pow(10, this.config.USDT.decimals);
            const isCorrectAmount = amount === parseFloat(order.amount.toString());

            return isCorrectToken && isCorrectAddress && isCorrectAmount;
        } catch (error) {
            console.error('Error validating TRC20 payment:', error);
            return false;
        }

    }
    async listWebhooks(currency: string): Promise<any> {
        const config = this.config[currency.toUpperCase()];
        if (!config) throw new Error(`Unsupported currency: ${currency}`);

        const response = await axios.get(`${config.apiUrl}/hooks?token=${config.apiKey}`);
        // console.log("🚀 ~ BlockchainService ~ listWebhooks ~ response:", response)
        return response.data as any[];
  
    }

    async deleteAllWebhooks(currency: string): Promise<void> {
        const config = this.config[currency.toUpperCase()];
        if (!config) throw new Error(`Unsupported currency: ${currency}`);

        const webhooks = await this.listWebhooks(currency);
        for (const webhook of webhooks) {
            await this.deleteWebhook(webhook.id, currency);
        }
    }

    async deleteWebhook(webhookId: string, currency: string): Promise<void> {
        try {
            const config = this.config[currency.toUpperCase()];
            if (!config) throw new Error(`Unsupported currency: ${currency}`);

            await axios.delete(`${config.apiUrl}/hooks/${webhookId}?token=${config.apiKey}`);
        } catch (error) {
            console.error('Error deleting webhook:', error);
            throw error;
        }
    }


    }
    
    export const blockchainService = BlockchainService.getInstance();
  
    // In blockchainService.ts
    // private async verifyTronTransaction(address: string, config: BlockchainConfig, isToken: boolean, orderId?: string): Promise<VerificationResult> {
    //     const baseApiUrl = 'https://api.trongrid.io';
    //     const MAX_ATTEMPTS = 3;

    //     try {
    //         // For USDT TRC20 token transactions
    //         const response = await axios.get(`${baseApiUrl}/v1/accounts/${address}/transactions/trc20`, {
    //             params: {
    //                 contract_address: config.usdtContract, // USDT contract address
    //                 only_confirmed: true,
    //                 limit: 20
    //             },
    //             headers: {
    //                 'TRON-PRO-API-KEY': process.env.TRON_API_KEY
    //             }
    //         });

    //         const transactions = (response.data as { data: any[] }).data;
    //         if (!transactions.length) {
    //             return {
    //                 verified: false,
    //                 status: 'pending',
    //                 message: 'No transactions found'
    //             };
    //         }

    //         // Find most recent confirmed transaction
    //         const recentTx = transactions[0];
    //         const txValue = parseInt(recentTx.value) / Math.pow(10, config.decimals);

    //         return {
    //             verified: true,
    //             status: 'completed',
    //             txHash: recentTx.transaction_id,
    //             amount: txValue,
    //             confirmations: config.minConfirmations,
    //             timestamp: recentTx.block_timestamp,
    //             explorerUrl: `${config.explorerUrl}${recentTx.transaction_id}`
    //         };
    //     } catch (error) {
    //         console.error('Error verifying USDT transaction:', error);
    //         throw error;
    //     }
    // }

