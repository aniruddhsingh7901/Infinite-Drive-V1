import sequelize from '../config/database';
import User from './userModel';
import Book from './Book';
// import Cart from './cartModel';
import Order from './orderModel';
import DownloadToken from './tokenModel';
import CryptoWallet from './cryptoWalletModel';
import Visitor from './visitorModel';
import AbandonedCart from './abandonedCartModel';
import AuthToken from './authTokenModel';

// Define associations
Book.hasMany(Order, { foreignKey: 'bookId', as: 'books' });
Order.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// Add User-Order association
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Add User-AuthToken association
User.hasMany(AuthToken, { foreignKey: 'userId' });
AuthToken.belongsTo(User, { foreignKey: 'userId' });

// Add Book-AbandonedCart association
Book.hasMany(AbandonedCart, { foreignKey: 'bookId', as: 'abandonedCarts' });
AbandonedCart.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// Initialize models
const initializeModels = async () => {
    try {
        // Do not use alter: true to avoid modifying existing tables
        await sequelize.sync({ force: false, alter: false });
        console.log('Database synchronized without schema changes');
    } catch (error) {
        console.error('Error synchronizing database:', error);
    }
};

// Export the initializeModels function to be called from app.ts
export { User, Book, Order, DownloadToken, CryptoWallet, Visitor, AbandonedCart, AuthToken, initializeModels };
