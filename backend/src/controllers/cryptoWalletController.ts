import { Request, Response } from 'express';
import { CryptoWallet } from '../models';
import { CRYPTO_CONFIG } from '../config/cryptoConfig';

// Get all crypto wallets
export const getCryptoWallets = async (req: Request, res: Response) => {
  try {
    // Try to get wallets from the database
    let wallets = await CryptoWallet.findAll();
    
    // If no wallets exist in the database yet, initialize them from the config
    if (wallets.length === 0) {
      const defaultWallets = [];
      
      for (const [symbol, config] of Object.entries(CRYPTO_CONFIG)) {
        // Skip Tron as we're removing it
        if (symbol === 'TRX') continue;
        
        defaultWallets.push({
          symbol,
          name: config.name,
          address: config.address || '',
          minConfirmations: config.minConfirmations,
          processingTime: parseInt(config.waitTime.split('-')[1]) || 30 // Extract max wait time
        });
      }
      
      // Create the default wallets in the database
      await CryptoWallet.bulkCreate(defaultWallets);
      
      // Fetch the newly created wallets
      wallets = await CryptoWallet.findAll();
    }
    
    return res.status(200).json(wallets);
  } catch (error) {
    console.error('Error fetching crypto wallets:', error);
    return res.status(500).json({ 
      message: 'Error fetching crypto wallets',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update a crypto wallet
export const updateCryptoWallet = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { address, minConfirmations, processingTime } = req.body;
    
    // Find the wallet by symbol
    const wallet = await CryptoWallet.findOne({ where: { symbol } });
    
    if (!wallet) {
      return res.status(404).json({ message: `Wallet with symbol ${symbol} not found` });
    }
    
    // Update the wallet
    await wallet.update({
      address,
      minConfirmations,
      processingTime
    });
    
    return res.status(200).json({ 
      message: 'Wallet updated successfully',
      wallet
    });
  } catch (error) {
    console.error('Error updating crypto wallet:', error);
    return res.status(500).json({ 
      message: 'Error updating crypto wallet',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
