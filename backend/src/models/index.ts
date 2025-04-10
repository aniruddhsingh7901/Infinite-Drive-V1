import sequelize from '../config/database';
import User from './userModel';
import Book from './Book';
// import Cart from './cartModel';
import Order from './orderModel';
import DownloadToken from './tokenModel';
import CryptoWallet from './cryptoWalletModel';
import Visitor from './visitorModel';
import AbandonedCart from './abandonedCartModel';

// Define associations
Book.hasMany(Order, { foreignKey: 'bookId', as: 'books' });
Order.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// Add User-Order association
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Add Book-AbandonedCart association
Book.hasMany(AbandonedCart, { foreignKey: 'bookId', as: 'abandonedCarts' });
AbandonedCart.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// Initialize models
const initializeModels = async () => {
    try {
        // Don't alter the tables, just use them as they are
        await sequelize.sync({ alter: false });
        console.log('Database synchronized');
    } catch (error) {
        console.error('Error synchronizing database:', error);
    }
};

initializeModels();

export { User, Book, Order, DownloadToken, CryptoWallet, Visitor, AbandonedCart };
