import { Request, Response } from 'express';
import Order from '../models/orderModel';

// Check if a user has purchased a specific book
export const checkPurchase = async (req: Request, res: Response) => {
  try {
    const { bookId, email } = req.query;

    if (!bookId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and email are required',
      });
    }

    // Find completed orders for this book and email
    const orders = await Order.findAll({
      where: {
        bookId: bookId as string,
        email: email as string,
        status: 'completed', // Only consider completed orders
      },
    });

    // If there's at least one completed order, the user has purchased the book
    const purchased = orders.length > 0;

    return res.status(200).json({
      success: true,
      purchased,
    });
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking purchase status',
      error: (error as Error).message,
    });
  }
};
