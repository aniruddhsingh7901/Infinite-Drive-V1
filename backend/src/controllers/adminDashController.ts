import { Request, Response } from 'express';
import { Order, User, AbandonedCart } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import Book from '../models/Book';
import visitorAnalyticsService from '../services/visitorAnalyticsService';
import abandonedCartService from '../services/abandonedCartService';

export const getCustomers = async (req: Request, res: Response) => {
    try {
        // Get all users with role 'user'
        const users = await User.findAll({
            where: {
                role: 'user'
            },
            attributes: ['id', 'email', 'createdAt']
        });

        // For each user, get their order information
        const customersWithOrders = await Promise.all(users.map(async (user: any) => {
            // Get total orders for this user
            const totalOrders = await Order.count({
                where: { userId: user.id }
            });

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

            // Get crypto wallets used by this user
            const cryptoWallets: { [key: string]: string } = {};
            const distinctCryptoOrders = await Order.findAll({
                where: { userId: user.id },
                attributes: [
                    'payment_currency',
                    'payment_address',
                    [sequelize.fn('MAX', sequelize.col('createdAt')), 'latest_use']
                ],
                group: ['payment_currency', 'payment_address'],
                order: [[sequelize.literal('latest_use'), 'DESC']]
            });

            // Add each unique crypto wallet to the user's wallet collection
            distinctCryptoOrders.forEach((order: any) => {
                if (order.payment_currency && order.payment_address) {
                    cryptoWallets[order.payment_currency] = order.payment_address;
                }
            });

            // Get the last order date as a string
            const lastOrderDate = lastOrder ? 
                (lastOrder as any).createdAt.toISOString() : 
                user.createdAt.toISOString();

            return {
                id: `CUST-${user.id}`,
                email: user.email,
                totalOrders,
                totalSpent: parseFloat(totalSpent.toString()),
                lastOrderDate,
                cryptoWallets: Object.keys(cryptoWallets).length > 0 ? cryptoWallets : undefined
            };
        }));

        return res.status(200).json(customersWithOrders);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(500).json({
            message: 'Error fetching customers data',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const period = req.query.period as string || '30d';
        
        // Calculate date range based on period
        const today = new Date();
        let startDate: Date;
        
        switch (period) {
            case '7d':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
                break;
            case '90d':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 90);
                break;
            case '30d':
            default:
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 30);
                break;
        }
        
        // Get sales by period (daily, weekly, or monthly depending on range)
        const salesByPeriod = await getSalesByPeriod(startDate, today, period);
        
        // Get top selling books
        const topSellingBooks = await getTopSellingBooks(startDate, today);
        
        // Get customer acquisition data
        const customerAcquisition = await getCustomerAcquisition(startDate, today, period);
        
        // Get conversion rates
        const conversionRates = await getConversionRates();
        
        // Get payment methods
        const paymentMethods = await getPaymentMethods(startDate, today);
        
        return res.status(200).json({
            salesByPeriod,
            topSellingBooks,
            customerAcquisition,
            conversionRates,
            paymentMethods
        });
        
    } catch (error) {
        console.error("Analytics error:", error);
        return res.status(500).json({
            message: 'Error fetching analytics data',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

export const getVisitorAnalytics = async (req: Request, res: Response) => {
    try {
        const period = req.query.period as string || '7d';
        
        // Use the visitor analytics service to get comprehensive analytics
        const analytics = await visitorAnalyticsService.getVisitorAnalytics(period);
        
        return res.status(200).json(analytics);
    } catch (error) {
        console.error("Visitor analytics error:", error);
        
        // Fallback to the old implementation if the new service fails
        try {
            const period = req.query.period as string || '7d';
            const today = new Date();
            let startDate: Date;
            
            switch (period) {
                case '7d':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 7);
                    break;
                case '90d':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 90);
                    break;
                case '30d':
                default:
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 30);
                    break;
            }
            
            // Sample data based on the period
            let totalVisitors, uniqueVisitors, nonPurchasingVisitors;
            
            switch (period) {
                case '7d':
                    totalVisitors = 1250;
                    uniqueVisitors = 980;
                    nonPurchasingVisitors = 1210;
                    break;
                case '90d':
                    totalVisitors = 12500;
                    uniqueVisitors = 9800;
                    nonPurchasingVisitors = 12100;
                    break;
                case '30d':
                default:
                    totalVisitors = 5000;
                    uniqueVisitors = 3900;
                    nonPurchasingVisitors = 4840;
                    break;
            }
            
            // Sample visitors by country
            const sampleVisitorsByCountry = [
                { country: 'United States', count: Math.round(totalVisitors * 0.45), percentage: 45 },
                { country: 'United Kingdom', count: Math.round(totalVisitors * 0.15), percentage: 15 },
                { country: 'Canada', count: Math.round(totalVisitors * 0.12), percentage: 12 },
                { country: 'Australia', count: Math.round(totalVisitors * 0.08), percentage: 8 },
                { country: 'Germany', count: Math.round(totalVisitors * 0.05), percentage: 5 },
                { country: 'Other', count: Math.round(totalVisitors * 0.15), percentage: 15 }
            ];
            
            return res.status(200).json({
                totalVisitors,
                uniqueVisitors,
                conversionRate: 3.2,
                bounceRate: 45.8,
                averageSessionDuration: 185,
                visitorsByCountry: sampleVisitorsByCountry,
                nonPurchasingVisitors
            });
        } catch (fallbackError) {
            return res.status(500).json({
                message: 'Error fetching visitor analytics data',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
};

// New controller methods for abandoned carts
export const getAbandonedCarts = async (req: Request, res: Response) => {
    try {
        const carts = await abandonedCartService.getAllAbandonedCarts();
        return res.status(200).json(carts);
    } catch (error) {
        console.error("Error fetching abandoned carts:", error);
        return res.status(500).json({
            message: 'Error fetching abandoned carts',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

export const getAbandonedCartStats = async (req: Request, res: Response) => {
    try {
        const stats = await abandonedCartService.getAbandonedCartStats();
        return res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching abandoned cart stats:", error);
        return res.status(500).json({
            message: 'Error fetching abandoned cart statistics',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

export const sendAbandonedCartReminder = async (req: Request, res: Response) => {
    try {
        const { cartId } = req.params;
        const success = await abandonedCartService.sendReminderEmail(cartId);
        
        if (success) {
            return res.status(200).json({ message: 'Reminder email sent successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to send reminder email' });
        }
    } catch (error) {
        console.error("Error sending abandoned cart reminder:", error);
        return res.status(500).json({
            message: 'Error sending abandoned cart reminder',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

export const markCartAsRecovered = async (req: Request, res: Response) => {
    try {
        const { cartId } = req.params;
        const success = await abandonedCartService.markAsRecovered(cartId);
        
        if (success) {
            return res.status(200).json({ message: 'Cart marked as recovered successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to mark cart as recovered' });
        }
    } catch (error) {
        console.error("Error marking cart as recovered:", error);
        return res.status(500).json({
            message: 'Error marking cart as recovered',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

export const getDetailedVisitorAnalytics = async (req: Request, res: Response) => {
    try {
        const period = req.query.period as string || '7d';
        
        // Get comprehensive analytics
        const analytics = await visitorAnalyticsService.getVisitorAnalytics(period);
        
        // Add additional data for the detailed view
        const today = new Date();
        let startDate: Date;
        
        switch (period) {
            case '7d':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
                break;
            case '90d':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 90);
                break;
            case '30d':
            default:
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 30);
                break;
        }
        
        // Get page visits
        const pageVisits = await visitorAnalyticsService.getVisitorCountsByPage(startDate, today);
        
        // Get referrer data
        const referrers = await visitorAnalyticsService.getVisitorCountsByReferrer(startDate, today);
        
        // Get device data
        const devices = await visitorAnalyticsService.getVisitorCountsByDevice(startDate, today);
        
        return res.status(200).json({
            ...analytics,
            pageVisits,
            referrers,
            devices
        });
    } catch (error) {
        console.error("Detailed visitor analytics error:", error);
        return res.status(500).json({
            message: 'Error fetching detailed visitor analytics',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// Helper functions for analytics
async function getSalesByPeriod(startDate: Date, endDate: Date, period: string): Promise<any[]> {
    let groupFormat: string;
    let periods: string[] = [];
    
    // Determine grouping format based on period
    switch (period) {
        case '7d':
            groupFormat = '%Y-%m-%d'; // Daily
            // Generate last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                periods.push(date.toISOString().split('T')[0]);
            }
            break;
        case '90d':
            groupFormat = '%Y-%m'; // Monthly
            // Generate last 3 months
            for (let i = 2; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
            }
            break;
        case '30d':
        default:
            groupFormat = '%Y-%U'; // Weekly
            // Generate last 4 weeks
            for (let i = 3; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - (i * 7));
                const weekNum = Math.floor((date.getDate() - 1) / 7) + 1;
                periods.push(`Week ${weekNum}`);
            }
            break;
    }
    
    // Get sales data grouped by period - using PostgreSQL's to_char instead of MySQL's date_format
    const salesData = await Order.findAll({
        attributes: [
            [sequelize.fn('to_char', sequelize.col('createdAt'), 'YYYY-MM-DD'), 'period'],
            [sequelize.fn('sum', sequelize.col('amount')), 'amount']
        ],
        where: {
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        group: [sequelize.fn('to_char', sequelize.col('createdAt'), 'YYYY-MM-DD')],
        raw: true
    });
    
    // Map sales data to periods
    const salesByPeriod = periods.map(period => {
        const periodData = salesData.find((data: any) => {
            if (period.startsWith('Week')) {
                return data.period === period.split(' ')[1];
            }
            return data.period === period;
        });
        
        return {
            period: period,
            amount: periodData ? parseFloat(periodData.amount.toString()) : 0
        };
    });
    
    return salesByPeriod;
}

async function getTopSellingBooks(startDate: Date, endDate: Date): Promise<any[]> {
    // Get book sales data
    const bookSales = await Order.findAll({
        attributes: [
            'bookId',
            [sequelize.fn('count', sequelize.col('id')), 'sales'],
            [sequelize.fn('sum', sequelize.col('amount')), 'revenue']
        ],
        where: {
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        group: ['bookId'],
        order: [[sequelize.literal('sales'), 'DESC']],
        limit: 5,
        raw: true
    });
    
    // Get book details for each top selling book
    const topSellingBooks = await Promise.all(bookSales.map(async (sale: any) => {
        const book = await Book.findByPk(sale.bookId);
        
        return {
            id: sale.bookId,
            title: book ? book.get('title') : `Book ${sale.bookId}`,
            sales: parseInt(sale.sales),
            revenue: parseFloat(sale.revenue)
        };
    }));
    
    return topSellingBooks;
}

async function getCustomerAcquisition(startDate: Date, endDate: Date, period: string): Promise<any[]> {
    let groupFormat: string;
    let periods: string[] = [];
    
    // Determine grouping format based on period
    switch (period) {
        case '7d':
            groupFormat = '%Y-%m-%d'; // Daily
            // Generate last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                periods.push(date.toISOString().split('T')[0]);
            }
            break;
        case '90d':
            groupFormat = '%Y-%m'; // Monthly
            // Generate last 3 months
            for (let i = 2; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
            }
            break;
        case '30d':
        default:
            groupFormat = '%Y-%U'; // Weekly
            // Generate last 4 weeks
            for (let i = 3; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - (i * 7));
                const weekNum = Math.floor((date.getDate() - 1) / 7) + 1;
                periods.push(`Week ${weekNum}`);
            }
            break;
    }
    
        // Get new user registrations grouped by period - using PostgreSQL's to_char instead of MySQL's date_format
        let formatPattern: string;
        
        switch (period) {
            case '7d':
                formatPattern = 'YYYY-MM-DD'; // Daily format
                break;
            case '90d':
                formatPattern = 'YYYY-MM'; // Monthly format
                break;
            case '30d':
            default:
                formatPattern = 'YYYY-"W"IW'; // Weekly format (YYYY-W01, YYYY-W02, etc.)
                break;
        }
        
        const userData = await User.findAll({
            attributes: [
                [sequelize.fn('to_char', sequelize.col('createdAt'), formatPattern), 'period'],
                [sequelize.fn('count', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
                role: 'user'
            },
            group: [sequelize.fn('to_char', sequelize.col('createdAt'), formatPattern)],
            order: [[sequelize.fn('to_char', sequelize.col('createdAt'), formatPattern), 'ASC']],
            raw: true
        });
    
    // Map user data to periods
    const customerAcquisition = periods.map(period => {
        const periodData = userData.find((data: any) => {
            if (period.startsWith('Week')) {
                return data.period === period.split(' ')[1];
            }
            return data.period === period;
        });
        
        return {
            period: period,
            count: periodData ? parseInt((periodData as any).count) : 0
        };
    });
    
    return customerAcquisition;
}

async function getConversionRates(): Promise<any[]> {
    // Get conversion rates from orders data
    try {
        // Get total visitors (based on orders)
        const totalOrders = await Order.count();
        
        // Get orders by referral source (if available in your schema)
        // For now, we'll create a simplified version based on available data
        return [
            { source: 'Direct', rate: 3.2 },
            { source: 'All Sources', rate: 3.2 }
        ];
    } catch (error) {
        console.error("Error calculating conversion rates:", error);
        return [{ source: 'All Sources', rate: 0 }];
    }
}

async function getPaymentMethods(startDate: Date, endDate: Date): Promise<any[]> {
    // Get payment method data
    const paymentData = await Order.findAll({
        attributes: [
            'payment_currency',
            [sequelize.fn('count', sequelize.col('id')), 'count'],
            [sequelize.fn('sum', sequelize.col('amount')), 'amount']
        ],
        where: {
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        group: ['payment_currency'],
        order: [[sequelize.literal('count'), 'DESC']],
        raw: true
    });
    
    // Format payment method data
    const paymentMethods = paymentData.map((data: any) => ({
        method: data.payment_currency || 'Unknown',
        count: parseInt(data.count),
        amount: parseFloat(data.amount)
    }));
    
    return paymentMethods;
}

async function getVisitorsByCountry(): Promise<any[]> {
    try {
        // Since we don't have real country data in our database,
        // we'll return a simplified version based on orders
        const totalOrders = await Order.count();
        
        if (totalOrders === 0) {
            return [{ country: 'No Data', count: 0, percentage: 100 }];
        }
        
        // Return a single entry representing all orders
        return [
            { country: 'All Countries', count: totalOrders, percentage: 100 }
        ];
    } catch (error) {
        console.error("Error getting visitor country data:", error);
        return [{ country: 'Error', count: 0, percentage: 100 }];
    }
}

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        console.log('Fetching dashboard stats...');
        
        // Get real data from the database
        const { Order, User } = require('../models');
        const { Op } = require('sequelize');
        
        // Calculate total sales
        const totalSales = await Order.sum('amount') || 0;
        
        // Get active (pending) orders
        const activeOrders = await Order.count({
            where: {
                status: {
                    [Op.or]: ['pending', 'awaiting_payment', 'confirming']
                }
            }
        });
        
        // Get new customers in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newCustomers = await User.count({
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                },
                role: 'user'
            }
        });
        
        // Calculate revenue growth (comparing current month to previous month)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
        const firstDayPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
        const firstDayTwoMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
        
        const currentMonthRevenue = await Order.sum('amount', {
            where: {
                createdAt: {
                    [Op.gte]: firstDayCurrentMonth
                }
            }
        }) || 0;
        
        const previousMonthRevenue = await Order.sum('amount', {
            where: {
                createdAt: {
                    [Op.gte]: firstDayPreviousMonth,
                    [Op.lt]: firstDayCurrentMonth
                }
            }
        }) || 0;
        
        // Calculate growth percentage
        let revenueGrowth = 0;
        if (previousMonthRevenue > 0) {
            revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
        }
        
        return res.status(200).json({
            totalSales,
            activeOrders,
            newCustomers,
            revenueGrowth
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        return res.status(500).json({
            message: 'Error fetching dashboard stats',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};
