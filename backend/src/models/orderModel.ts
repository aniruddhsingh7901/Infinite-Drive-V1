

// src/models/orderModel.ts
import { Model, DataTypes, Op } from 'sequelize';
import sequelize from '../config/database';
import { webSocketService } from '../app';

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
        const [numUpdated, updatedOrders] = await this.update(
            update,
            {
                where: { id: orderId },
                returning: true
            }
        );
        
        if (numUpdated > 0 && updatedOrders && updatedOrders.length > 0) {
            const updatedOrder = updatedOrders[0];
            // Broadcast the update to admin clients
            try {
                webSocketService.broadcastOrderUpdate(updatedOrder);
                webSocketService.broadcastDashboardUpdate();
            } catch (error) {
                console.error('Error broadcasting order update:', error);
            }
        }
        
        return [numUpdated, updatedOrders];
    }
    
    static async findRecentOrders(limit: number = 5) {
        return await this.findAll({
            order: [['createdAt', 'DESC']],
            limit
        });
    }
    
    static async findPendingOrders() {
        return await this.findAll({
            where: { status: 'pending' },
            order: [['createdAt', 'DESC']]
        });
    }
    
    static async findCompletedOrders() {
        return await this.findAll({
            where: { status: 'completed' },
            order: [['createdAt', 'DESC']]
        });
    }
    
    static async getDailyOrders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return await this.findAll({
            where: {
                createdAt: {
                    [Op.gte]: today
                }
            },
            order: [['createdAt', 'DESC']]
        });
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
            type: DataTypes.INTEGER,
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
