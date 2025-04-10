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
            type: DataTypes.STRING,
            allowNull: false,
        },
        userAgent: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        referrer: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sessionId: {
            type: DataTypes.STRING,
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
