// src/models/abandonedCartModel.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class AbandonedCart extends Model {
    declare id: string;
    declare email: string;
    declare bookId: string;
    declare format: string;
    declare amount: number;
    declare payment_currency: string;
    declare createdAt: Date;
    declare updatedAt: Date;
    declare reminderSent: boolean;
    declare reminderSentAt: Date | null;
    declare recovered: boolean;
    declare recoveredAt: Date | null;
}

AbandonedCart.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        bookId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        format: {
            type: DataTypes.STRING,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: false
        },
        payment_currency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reminderSent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        reminderSentAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        recovered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        recoveredAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'AbandonedCart',
        tableName: 'abandoned_carts',
        timestamps: true
    }
);

export default AbandonedCart;
