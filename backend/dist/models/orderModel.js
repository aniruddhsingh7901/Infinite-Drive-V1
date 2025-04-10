"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/orderModel.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Order extends sequelize_1.Model {
    static async updateOrderStatus(orderId, update) {
        return await this.update(update, {
            where: { id: orderId },
            returning: true
        });
    }
}
Order.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    bookId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    format: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'pending',
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    txHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(20, 8),
        allowNull: false
    },
    payment_currency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    payment_address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    downloadLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    downloadToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    downloadExpiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    // Review-related fields
    rating: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5
        }
    },
    reviewTitle: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    reviewContent: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    reviewApproved: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    reviewedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
}, {
    sequelize: database_1.default,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true
});
exports.default = Order;
//# sourceMappingURL=orderModel.js.map