"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbandonedCart = exports.Visitor = exports.CryptoWallet = exports.DownloadToken = exports.Order = exports.Book = exports.User = void 0;
const database_1 = __importDefault(require("../config/database"));
const userModel_1 = __importDefault(require("./userModel"));
exports.User = userModel_1.default;
const Book_1 = __importDefault(require("./Book"));
exports.Book = Book_1.default;
// import Cart from './cartModel';
const orderModel_1 = __importDefault(require("./orderModel"));
exports.Order = orderModel_1.default;
const tokenModel_1 = __importDefault(require("./tokenModel"));
exports.DownloadToken = tokenModel_1.default;
const cryptoWalletModel_1 = __importDefault(require("./cryptoWalletModel"));
exports.CryptoWallet = cryptoWalletModel_1.default;
const visitorModel_1 = __importDefault(require("./visitorModel"));
exports.Visitor = visitorModel_1.default;
const abandonedCartModel_1 = __importDefault(require("./abandonedCartModel"));
exports.AbandonedCart = abandonedCartModel_1.default;
// Define associations
Book_1.default.hasMany(orderModel_1.default, { foreignKey: 'bookId', as: 'books' });
orderModel_1.default.belongsTo(Book_1.default, { foreignKey: 'bookId', as: 'book' });
// Add User-Order association
userModel_1.default.hasMany(orderModel_1.default, { foreignKey: 'userId' });
orderModel_1.default.belongsTo(userModel_1.default, { foreignKey: 'userId', as: 'user' });
// Add Book-AbandonedCart association
Book_1.default.hasMany(abandonedCartModel_1.default, { foreignKey: 'bookId', as: 'abandonedCarts' });
abandonedCartModel_1.default.belongsTo(Book_1.default, { foreignKey: 'bookId', as: 'book' });
// Initialize models
const initializeModels = async () => {
    try {
        // Use alter: true to update the schema without dropping tables
        await database_1.default.sync({ alter: true });
        console.log('Database synchronized and schema updated');
    }
    catch (error) {
        console.error('Error synchronizing database:', error);
    }
};
initializeModels();
//# sourceMappingURL=index.js.map