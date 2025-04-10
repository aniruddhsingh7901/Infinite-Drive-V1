import { Request, Response } from 'express';
import { Order, Book } from '../models';
import { DownloadController } from './downloadController';
import EmailService from '../services/emailService';
import { BlockchainService } from '../services/blockchainService';

const emailService = EmailService
const downloadController = new DownloadController();




const handleSuccessfulPayment = async (order: Order, txHash:string): Promise<string> => {
    try {
        // console.log("🚀 ~ handleSuccessfulPayment ~ order:", order);
        
        // Extract the base book ID without any format suffix
        const baseBookId = order.bookId;
        console.log("Looking up book with ID:", baseBookId, "from original order bookId:", order.bookId);
        
        const book = await Book.findByPk(baseBookId);
        if (!book) throw new Error(`Book not found with ID: ${baseBookId} (original: ${order.bookId})`);
        if (!order) throw new Error('Order not found');

        // Generate download token
        const downloadTokenObj = await downloadController.generateDownloadToken(order.id);
        const downloadToken = downloadTokenObj.get('token');
        console.log("🚀 ~ handleSuccessfulPayment ~ downloadToken:", downloadToken);

        // Get selected format from order
        const format = order.format.toLowerCase();

        // Generate format-specific download link
        const downloadLink = `${process.env.API_URL}/download/${downloadToken}?format=${format}`;
        console.log("🚀 ~ handleSuccessfulPayment ~ downloadLink:", downloadLink);

        // Update order status to completed
        await Order.update({
            status: 'completed',
            downloadToken,
            downloadLink,
            completedAt: new Date(Date.now())
        }, {
            where: { id: order.id }
        });

        // Prepare download links based on format
        const downloadLinks: { pdf?: string; epub?: string } = {};
        if (format === 'pdf') {
            downloadLinks.pdf = downloadLink;
        } else if (format === 'epub') {
            downloadLinks.epub = downloadLink;
        }

        // Check if there are any bonus items for this book
        const bonusItems: { name: string; link: string }[] = [];
        // This would be populated from a bonuses table in a real implementation
        // For now, we'll leave it empty

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
        const downloadLinkSent = await emailService.sendDownloadLink(
            order.email,
            downloadLinks,
            txHash,
            book.title,
            bonusItems
        );
        
        if (!downloadLinkSent) {
            console.warn(`Failed to send download link email for order: ${order.id}`);
            // Continue with the process even if email fails
        }

        return downloadLink;
    } catch (error) {
        console.error('Error handling successful payment:', error);
        throw error;
    }
};

export const checkOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        console.log("🚀 ~ checkOrderStatus ~ req.params:", req.params);

        const order = await Order.findOne({ 
            where: { id: orderId }
        });

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Get confirmation information if available
        let confirmations = 0;
        let requiredConfirmations = 3; // Default value
        
        // Set required confirmations based on currency
        if (order.payment_currency) {
            const currency = order.payment_currency.toUpperCase();
            const blockchainSvc = new BlockchainService();
            const currencyConfig = blockchainSvc.config[currency];
            if (currencyConfig) {
                requiredConfirmations = currencyConfig.minConfirmations;
            }
        }

        if (order.status === 'completed' && order.txHash) {
            // If order is already completed but doesn't have a download link, generate one
            let downloadLink = order.downloadLink;
            
            if (!downloadLink) {
                downloadLink = await handleSuccessfulPayment(order, order.txHash);
            }
            
            console.log("🚀 ~ checkOrderStatus ~ downloadLink:", downloadLink);
           
            res.status(200).json({ 
                status: 'completed', 
                txHash: order.txHash, 
                downloadLink: downloadLink, 
                email: order.email,
                confirmations: requiredConfirmations, // For completed orders, show full confirmations
                requiredConfirmations
            });
        }
       
    } catch (error) {
        console.error('Error checking order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.status(200).json(order);
    } catch (error) {
        console.error('Error getting order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.findAll({
            // Assuming you have a Book model
        });

        const formattedOrders = orders.map(order => ({
            id: order.id,
            customerEmail: order.email,
            bookId: order.bookId, // Assuming the association is set up correctly
            format: order.format,
            amount: order.amount,
            paymentMethod: order.payment_currency,
            status: order.status,
        }));
        // console.log("🚀 ~ getAllOrders ~ formattedOrders:", formattedOrders)

        res.status(200).json(formattedOrders);
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        const updateData = req.body;
        const [updated] = await Order.update(updateData, {
            where: { id: orderId }
        });
        if (!updated) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        const updatedOrder = await Order.findByPk(orderId);
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        console.log("🚀 ~ deleteOrder ~ req.params:", req.params)
        const deleted = await Order.destroy({
            where: { id: orderId }
        });
        if (!deleted) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
