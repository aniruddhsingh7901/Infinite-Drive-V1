

// src/models/orderModel.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Order extends Model {
    declare id: string;
    declare userId: string;
    declare bookId: string;
    declare format: string;
    declare status: string;
    declare email: string;
    declare txHash: string | null;
    declare amount: number;
    declare payment_currency: string;
    declare payment_address: string;
    declare downloadLink: string | null;
    declare downloadToken: string | null;
    declare downloadExpiresAt: Date | null;
    declare rating: number | null;
    declare reviewTitle: string | null;
    declare reviewContent: string | null;
    declare reviewApproved: boolean | null;
    declare reviewedAt: Date | null;

    static async updateOrderStatus(orderId: string, update: any) {
        return await this.update(
            update,
            {
                where: { id: orderId },
                returning: true
            }
        );
    }
}

Order.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        bookId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        format: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending',
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        txHash: {
            type: DataTypes.STRING,
            allowNull: true
        },
        amount: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: false
        },
        payment_currency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        payment_address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        downloadLink: {
            type: DataTypes.STRING,
            allowNull: true
        },
        downloadToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        downloadExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        // Review-related fields
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 5
            }
        },
        reviewTitle: {
            type: DataTypes.STRING,
            allowNull: true
        },
        reviewContent: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        reviewApproved: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        reviewedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
    },
    {
        sequelize,
        modelName: 'Order',
        tableName: 'orders',
        timestamps: true
    }
);

export default Order;
