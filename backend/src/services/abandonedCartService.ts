import { AbandonedCart, Book } from '../models';
import emailService from './emailService';
import { Op } from 'sequelize';

class AbandonedCartService {
  /**
   * Create a new abandoned cart record
   */
  async createAbandonedCart(cartData: {
    email: string;
    bookId: string;
    format: string;
    amount: number;
    payment_currency: string;
  }) {
    try {
      const cart = await AbandonedCart.create(cartData);
      return cart;
    } catch (error) {
      console.error('Error creating abandoned cart:', error);
      throw error;
    }
  }

  /**
   * Get all abandoned carts
   */
  async getAllAbandonedCarts() {
    try {
      const carts = await AbandonedCart.findAll({
        include: [
          {
            model: Book,
            as: 'book',
            attributes: ['title', 'author', 'price']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return carts;
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
      throw error;
    }
  }

  /**
   * Get abandoned carts that haven't received a reminder yet
   */
  async getPendingReminderCarts() {
    try {
      // Find carts that are at least 24 hours old and haven't received a reminder
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const carts = await AbandonedCart.findAll({
        where: {
          reminderSent: false,
          recovered: false,
          createdAt: {
            [Op.lt]: oneDayAgo
          }
        },
        include: [
          {
            model: Book,
            as: 'book',
            attributes: ['title', 'author', 'price']
          }
        ]
      });
      return carts;
    } catch (error) {
      console.error('Error fetching pending reminder carts:', error);
      throw error;
    }
  }

  /**
   * Send reminder email for an abandoned cart
   */
  async sendReminderEmail(cartId: string) {
    try {
      const cart = await AbandonedCart.findByPk(cartId, {
        include: [
          {
            model: Book,
            as: 'book',
            attributes: ['title', 'author', 'price']
          }
        ]
      });

      if (!cart) {
        throw new Error(`Cart with ID ${cartId} not found`);
      }

      const book = cart.get('book') as any;
      
      // Generate a recovery link (this would typically include a token)
      const recoveryLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout?recover=${cartId}`;
      
      // Send the email
      const subject = `Complete Your Purchase: ${book.title}`;
      const body = `
Dear Customer,

We noticed you didn't complete your purchase of "${book.title}".

Your cart is still waiting for you! Click the link below to complete your purchase:
${recoveryLink}

If you have any questions or need assistance, please reply to this email.

Best regards,
The Infinite Drive Team
      `;

      const emailSent = await emailService.sendEmail(cart.get('email') as string, subject, body);
      
      if (emailSent) {
        // Update the cart record
        await cart.update({
          reminderSent: true,
          reminderSentAt: new Date()
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending reminder email:', error);
      throw error;
    }
  }

  /**
   * Mark a cart as recovered
   */
  async markAsRecovered(cartId: string) {
    try {
      const cart = await AbandonedCart.findByPk(cartId);
      
      if (!cart) {
        throw new Error(`Cart with ID ${cartId} not found`);
      }
      
      await cart.update({
        recovered: true,
        recoveredAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error marking cart as recovered:', error);
      throw error;
    }
  }

  /**
   * Get abandoned cart statistics
   */
  async getAbandonedCartStats() {
    try {
      // Total abandoned carts
      const totalCarts = await AbandonedCart.count();
      
      // Recovered carts
      const recoveredCarts = await AbandonedCart.count({
        where: { recovered: true }
      });
      
      // Recovery rate
      const recoveryRate = totalCarts > 0 ? (recoveredCarts / totalCarts) * 100 : 0;
      
      // Total potential revenue lost (from unrecovered carts)
      const unrecoveredCarts = await AbandonedCart.findAll({
        where: { recovered: false },
        attributes: ['amount']
      });
      
      const potentialRevenueLost = unrecoveredCarts.reduce((total, cart) => {
        return total + parseFloat((cart.get('amount') as any).toString());
      }, 0);
      
      return {
        totalCarts,
        recoveredCarts,
        recoveryRate,
        potentialRevenueLost
      };
    } catch (error) {
      console.error('Error getting abandoned cart stats:', error);
      throw error;
    }
  }
}

export default new AbandonedCartService();
