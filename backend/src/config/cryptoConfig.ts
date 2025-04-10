export const CRYPTO_CONFIG = {
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    address: process.env.BTC_ADDRESS,
    decimals: 8,
    minConfirmations: 3,
    networkFee: '0.0001 BTC',
    waitTime: '10-60 minutes',
    qrFormat: (address: string, amount: string) => 
      `bitcoin:${address}?amount=${parseFloat(amount).toFixed(8)}`,
    explorerUrl: 'https://www.blockchain.com/btc/tx/'
  },
  LTC: {
    name: 'Litecoin',
    symbol: 'LTC', 
    address: process.env.LTC_ADDRESS,
    decimals: 8,
    minConfirmations: 3,
    networkFee: '0.001 LTC',
    waitTime: '2-30 minutes',
    qrFormat: (address: string, amount: string) =>
      `litecoin:${address}?amount=${parseFloat(amount).toFixed(8)}`,
    explorerUrl: 'https://blockchair.com/litecoin/transaction/'
  },
  XMR: {
    name: 'Monero',
    symbol: 'XMR',
    address: process.env.XMR_ADDRESS,
    decimals: 12,
    minConfirmations: 10,
    networkFee: '0.0001 XMR',
    waitTime: '20-60 minutes',
    qrFormat: (address: string, amount: string) =>
      `monero:${address}?tx_amount=${parseFloat(amount).toFixed(12)}`,
    explorerUrl: 'https://xmrchain.net/tx/'
  },
  SOL: {
    name: 'Solana',
    symbol: 'SOL',
    address: process.env.SOL_ADDRESS,
    decimals: 9,
    minConfirmations: 3,
    networkFee: '0.000005 SOL',
    waitTime: '1-5 minutes',
    qrFormat: (address: string, amount: string) =>
      `solana:${address}?amount=${parseFloat(amount).toFixed(9)}`,
    explorerUrl: 'https://explorer.solana.com/tx/'
  },
  DOGE: {
    name: 'Dogecoin', 
    symbol: 'DOGE',
    address: process.env.DOGE_ADDRESS,
    decimals: 8,
    minConfirmations: 3,
    networkFee: '1 DOGE',
    waitTime: '10-30 minutes',
    qrFormat: (address: string, amount: string) =>
      `dogecoin:${address}?amount=${parseFloat(amount).toFixed(8)}`,
    explorerUrl: 'https://dogechain.info/tx/'
  },
  USDT: {
    name: 'Tether TRC20',
    symbol: 'USDT',
    address: process.env.USDT_ADDRESS,
    decimals: 6,
    minConfirmations: 19,
    networkFee: '1 TRX',
    waitTime: '5-20 minutes',
    qrFormat: (address: string, amount: string) => {
      const amountInUnits = Math.floor(parseFloat(amount) * 1e6);
      return `tron://transfer?toAddress=${address}&amount=${amountInUnits}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`;
    },
    explorerUrl: 'https://tronscan.org/#/transaction/',
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
  },
};

export default CRYPTO_CONFIG;
