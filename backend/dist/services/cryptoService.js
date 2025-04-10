"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const axios_1 = __importDefault(require("axios"));
class CryptoService {
    constructor() {
        this.COINGECKO_API = 'https://api.coingecko.com/api/v3';
    }
    async getPrices(fiatAmount, currency = 'usd') {
        try {
            const response = await axios_1.default.get(`${this.COINGECKO_API}/simple/price?ids=bitcoin,litecoin,monero,solana,dogecoin,tether&vs_currencies=${currency}`);
            const prices = response.data;
            const cryptoAmounts = {};
            // Bitcoin (BTC) - Format to 8 decimal places (standard for BTC)
            if (prices.bitcoin && prices.bitcoin[currency]) {
                const btcAmount = fiatAmount / prices.bitcoin[currency];
                cryptoAmounts.BTC = parseFloat(btcAmount.toFixed(8));
            }
            // Litecoin (LTC) - Format to 8 decimal places
            if (prices.litecoin && prices.litecoin[currency]) {
                const ltcAmount = fiatAmount / prices.litecoin[currency];
                cryptoAmounts.LTC = parseFloat(ltcAmount.toFixed(8));
            }
            // Monero (XMR) - Format to 6 decimal places
            if (prices.monero && prices.monero[currency]) {
                const xmrAmount = fiatAmount / prices.monero[currency];
                cryptoAmounts.XMR = parseFloat(xmrAmount.toFixed(6));
            }
            // Solana (SOL) - Format to 4 decimal places
            if (prices.solana && prices.solana[currency]) {
                const solAmount = fiatAmount / prices.solana[currency];
                cryptoAmounts.SOL = parseFloat(solAmount.toFixed(4));
            }
            // Dogecoin (DOGE) - Format to 2 decimal places
            if (prices.dogecoin && prices.dogecoin[currency]) {
                const dogeAmount = fiatAmount / prices.dogecoin[currency];
                cryptoAmounts.DOGE = parseFloat(dogeAmount.toFixed(2));
            }
            // Tether (USDT) - Stablecoin, typically 1:1 with USD - Format to 2 decimal places
            if (prices.tether && prices.tether[currency]) {
                const usdtAmount = fiatAmount / prices.tether[currency];
                cryptoAmounts.USDT = parseFloat(usdtAmount.toFixed(2));
            }
            else {
                // Fallback if price not available
                cryptoAmounts.USDT = parseFloat(fiatAmount.toFixed(2));
            }
            // Log the conversion results for debugging
            console.log('Crypto conversion results:', {
                fiatAmount,
                currency,
                prices: JSON.stringify(prices),
                cryptoAmounts
            });
            return cryptoAmounts;
        }
        catch (error) {
            console.error('Error fetching crypto prices:', error);
            throw new Error('Failed to fetch crypto prices');
        }
    }
}
exports.CryptoService = CryptoService;
//# sourceMappingURL=cryptoService.js.map