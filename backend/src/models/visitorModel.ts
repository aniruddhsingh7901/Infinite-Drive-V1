// src/models/visitorModel.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Visitor extends Model {
    declare id: string;
    declare ip: string;
    declare userAgent: string;
    declare path: string;
    declare referrer: string | null;
    declare country: string | null;
    declare city: string | null;
    declare sessionId: string;
    declare visitDate: Date;
}

Visitor.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ip: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        userAgent: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        path: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        referrer: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        country: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        city: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        sessionId: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        visitDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        modelName: 'Visitor',
        tableName: 'visitors',
        timestamps: true
    }
);

export default Visitor;
