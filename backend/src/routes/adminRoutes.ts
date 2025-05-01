import { Router } from 'express';
import { 
  getDashboardStats, 
  getCustomers, 
  getAnalytics, 
  getVisitorAnalytics,
  getDetailedVisitorAnalytics,
  getAbandonedCarts,
  getAbandonedCartStats,
  sendAbandonedCartReminder,
  markCartAsRecovered,
  exportCustomerEmails
} from '../controllers/adminDashController';
import { authenticate } from '../middleware/authMiddleware';
import { CryptoService } from '../services/cryptoService';
import { Op } from 'sequelize';


const router = Router();

// Dashboard stats
router.get('/dashboard/stats', authenticate, getDashboardStats);
router.get('/dashboard-stats', authenticate, getDashboardStats); // Add this for backward compatibility

// Customers
router.get('/customers', authenticate, getCustomers);
router.get('/customers/export', authenticate, exportCustomerEmails);
router.get('/customers/recent', authenticate, async (req, res) => {
  try {
    console.log('Fetching recent customers...');
    
    // Get real customer data from the database
    const { User, Order } = require('../models');
    const sequelize = require('../config/database').default;
    
    // Get all users with role 'user'
    const users = await User.findAll({
      where: {
        role: 'user'
      },
      attributes: ['id', 'email', 'createdAt'],
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    // For each user, get their order information
    const recentCustomers = await Promise.all(users.map(async (user: any) => {
      // Get total spent by this user
      const totalSpent = await Order.sum('amount', {
        where: { userId: user.id }
      }) || 0;

      // Get the last order date
      const lastOrder = await Order.findOne({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      });

      // Get the last order date as a string
      const lastOrderDate = lastOrder ? 
        (lastOrder as any).createdAt : 
        user.createdAt;

      return {
        id: `CUST-${user.id}`,
        email: user.email,
        totalSpent: parseFloat(totalSpent.toString()),
        lastOrderDate
      };
    }));
    
    res.status(200).json(recentCustomers);
  } catch (error) {
    console.error('Error fetching recent customers:', error);
    res.status(500).json({ message: 'Error fetching recent customers' });
  }
});

// Orders
router.get('/orders/all', authenticate, async (req, res) => {
  try {
    console.log('Fetching all orders...');
    
    // Get real order data from the database
    const { Order, Book, User } = require('../models');
    
    // Get all orders without including the User model to avoid type mismatch
    const allOrders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['title']
        }
      ]
    });

    if (allOrders && allOrders.length > 0) {
      const formattedOrders = allOrders.map((order: any) => {
        // Get book title if available
        let bookTitle = order.bookId;
        if (order.book && order.book.title) {
          bookTitle = order.book.title;
        }
        
        // Get customer email
        let customerEmail = order.email;
        if (order.user && order.user.email) {
          customerEmail = order.user.email;
        }
        
        return {
          id: order.id,
          customerEmail: customerEmail,
          bookTitle: bookTitle,
          bookId: order.bookId,
          format: order.format,
          amount: order.amount,
          paymentMethod: order.payment_currency,
          status: order.status || 'pending',
          createdAt: order.createdAt,
          txHash: order.txHash
        };
      });
      
      return res.status(200).json(formattedOrders);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Error fetching all orders' });
  }
});

router.get('/orders/recent', authenticate, async (req, res) => {
  try {
    console.log('Fetching recent orders...');

    const { Order, Book } = require('../models');

    // Fetch recent orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['title'],
        },
      ],
    });

    if (recentOrders && recentOrders.length > 0) {
      // Format the orders
      const formattedOrders = recentOrders.map((order: any) => {
        // Get book title if available
        let bookTitle = 'Unknown';
        if (order.book && order.book.title) {
          bookTitle = order.book.title;
        }

        return {
          id: order.id,
          customerEmail: order.email,
          bookId: bookTitle,
          amount: order.amount, // Send the amount directly from the database
          paymentCurrency: order.payment_currency, // Send the payment currency directly from the database
          status: order.status || 'pending',
          createdAt: order.createdAt,
        };
      });

      return res.status(200).json(formattedOrders);
    } else {
      console.log('No recent orders found');
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ message: 'Error fetching recent orders' });
  }
});

// Analytics
router.get('/analytics', authenticate, getAnalytics);
router.get('/analytics/visitors', authenticate, getVisitorAnalytics);
router.get('/analytics/visitors/detailed', authenticate, getDetailedVisitorAnalytics);

// Abandoned Carts
router.get('/abandoned-carts', authenticate, getAbandonedCarts);
router.get('/abandoned-carts/stats', authenticate, getAbandonedCartStats);
router.post('/abandoned-carts/:cartId/send-reminder', authenticate, sendAbandonedCartReminder);
router.post('/abandoned-carts/:cartId/mark-recovered', authenticate, markCartAsRecovered);

// Reviews
router.get('/reviews', authenticate, async (req, res) => {
  try {
    console.log('Fetching reviews...');
    
    // Get real review data from the database
    const { Order, Book } = require('../models');
    
    // Get all orders with ratings without including the User model to avoid type mismatch
    const orders = await Order.findAll({
      where: {
        rating: {
          [Op.not]: null
        }
      },
      include: [
        {
          model: Book,
          attributes: ['title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform orders with ratings into reviews
    const reviews = orders.map((order: any) => {
      const email = order.user ? order.user.email : order.email;
      const name = email ? email.split('@')[0] : 'Anonymous';
      const bookTitle = order.book ? order.book.title : 'Unknown Book';
      
      return {
        id: `review-${order.id}`,
        orderId: order.id,
        userId: order.user ? order.user.id : null,
        name: name,
        email: email,
        rating: order.rating || 5,
        date: order.createdAt.toISOString(),
        title: order.reviewTitle || `Review for ${bookTitle}`,
        content: order.reviewContent || 'I really enjoyed this product. It exceeded my expectations!',
        verified: true,
        approved: order.reviewApproved !== false, // Default to true if not set
        bookId: order.bookId
      };
    });

    // If no reviews found, return empty array
    if (reviews.length === 0) {
      console.log('No reviews found');
      return res.status(200).json([]);
    }

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      message: 'Error fetching reviews data',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Update review status
router.put('/reviews/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;
    
    if (id.startsWith('review-')) {
      const orderId = id.replace('review-', '');
      
      // Find the order
      const { Order } = require('../models');
      const order = await Order.findByPk(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      // Update the review approval status
      await order.update({
        reviewApproved: approved
      });
      
      return res.status(200).json({ message: 'Review status updated successfully' });
    } else {
      // For sample reviews, just return success
      return res.status(200).json({ message: 'Review status updated successfully' });
    }
  } catch (error) {
    console.error("Error updating review status:", error);
    return res.status(500).json({
      message: 'Error updating review status',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Delete review
router.delete('/reviews/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id.startsWith('review-')) {
      const orderId = id.replace('review-', '');
      
      // Find the order
      const { Order } = require('../models');
      const order = await Order.findByPk(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      // Update the order to remove review data
      await order.update({
        rating: null,
        reviewTitle: null,
        reviewContent: null,
        reviewApproved: null,
        reviewedAt: null
      });
      
      return res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      // For sample reviews, just return success
      return res.status(200).json({ message: 'Review deleted successfully' });
    }
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      message: 'Error deleting review',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Public reviews endpoint (no authentication required)
router.get('/public/reviews', async (req, res) => {
  try {
    console.log('Fetching public reviews...');
    
    // Get real review data from the database
    const { Order, User, Book } = require('../models');
    
    // Get all orders with ratings that are approved without including the User model to avoid type mismatch
    const orders = await Order.findAll({
      where: {
        rating: {
          [Op.not]: null
        },
        reviewApproved: true
      },
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform orders with ratings into reviews
    const reviews = orders.map((order: any) => {
      const email = order.user ? order.user.email : order.email;
      const name = email ? email.split('@')[0] : 'Anonymous';
      
      return {
        id: order.id,
        name: name,
        rating: order.rating || 5,
        date: order.createdAt.toISOString().split('T')[0],
        title: order.reviewTitle || 'Great product!',
        content: order.reviewContent || 'I really enjoyed this product. It exceeded my expectations!',
        verified: true
      };
    });

    // If no reviews found, return empty array
    if (reviews.length === 0) {
      console.log('No public reviews found');
      return res.status(200).json([]);
    }

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching public reviews:", error);
    return res.status(500).json({
      message: 'Error fetching reviews data'
    });
  }
});

// Public FAQs endpoint (no authentication required)
router.get('/public/faqs', async (req, res) => {
  try {
    console.log('Fetching public FAQs...');
    
    // In a real application, you would fetch FAQs from your database
    // For now, we'll return sample FAQs
    const faqs = [
      {
        id: '1',
        question: 'What is Infinite Drive?',
        answer: 'Infinite Drive is a digital product that helps you unlock your full potential and achieve your goals through proven strategies and techniques.',
        category: 'general',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        question: 'How do I access my purchase?',
        answer: 'After completing your purchase, you will receive an email with download instructions. You can also access your purchase from the "Downloads" section of your account.',
        category: 'delivery',
        order: 2,
        isActive: true
      },
      {
        id: '3',
        question: 'What payment methods do you accept?',
        answer: 'We accept credit cards, PayPal, and various cryptocurrencies including Bitcoin, Ethereum, and Litecoin.',
        category: 'payment',
        order: 3,
        isActive: true
      },
      {
        id: '4',
        question: 'Do you offer refunds?',
        answer: 'Due to the digital nature of our products, we do not offer refunds. However, if you encounter any issues with your purchase, please contact our support team.',
        category: 'payment',
        order: 4,
        isActive: true
      },
      {
        id: '5',
        question: 'Can I use Infinite Drive on multiple devices?',
        answer: 'Yes, you can access Infinite Drive on up to 3 devices with a single purchase.',
        category: 'technical',
        order: 5,
        isActive: true
      },
      {
        id: '6',
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption to protect your payment information. We do not store your credit card details on our servers.',
        category: 'payment',
        order: 6,
        isActive: true
      },
      {
        id: '7',
        question: 'How can I contact support?',
        answer: 'You can contact our support team by emailing support@infinitedriven.com or by using the contact form on our website.',
        category: 'general',
        order: 7,
        isActive: true
      }
    ];
    
    return res.status(200).json(faqs);
  } catch (error) {
    console.error("Error fetching public FAQs:", error);
    return res.status(500).json({
      message: 'Error fetching FAQs data'
    });
  }
});

// FAQs (admin endpoint)
router.get('/faqs', authenticate, async (req, res) => {
  try {
    console.log('Fetching FAQs...');
    
    // In a real application, you would fetch FAQs from your database
    // For now, we'll return sample FAQs
    const faqs = [
      {
        id: '1',
        question: 'What is Infinite Drive?',
        answer: 'Infinite Drive is a digital product that helps you unlock your full potential and achieve your goals through proven strategies and techniques.',
        category: 'general',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        question: 'How do I access my purchase?',
        answer: 'After completing your purchase, you will receive an email with download instructions. You can also access your purchase from the "Downloads" section of your account.',
        category: 'delivery',
        order: 2,
        isActive: true
      },
      {
        id: '3',
        question: 'What payment methods do you accept?',
        answer: 'We accept credit cards, PayPal, and various cryptocurrencies including Bitcoin, Ethereum, and Litecoin.',
        category: 'payment',
        order: 3,
        isActive: true
      },
      {
        id: '4',
        question: 'Do you offer refunds?',
        answer: 'Due to the digital nature of our products, we do not offer refunds. However, if you encounter any issues with your purchase, please contact our support team.',
        category: 'payment',
        order: 4,
        isActive: true
      },
      {
        id: '5',
        question: 'Can I use Infinite Drive on multiple devices?',
        answer: 'Yes, you can access Infinite Drive on up to 3 devices with a single purchase.',
        category: 'technical',
        order: 5,
        isActive: true
      },
      {
        id: '6',
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption to protect your payment information. We do not store your credit card details on our servers.',
        category: 'payment',
        order: 6,
        isActive: true
      },
      {
        id: '7',
        question: 'How can I contact support?',
        answer: 'You can contact our support team by emailing support@infinitedriven.com or by using the contact form on our website.',
        category: 'general',
        order: 7,
        isActive: true
      }
    ];
    
    return res.status(200).json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return res.status(500).json({
      message: 'Error fetching FAQs data',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
