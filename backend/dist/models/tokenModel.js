"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/downloadToken.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class DownloadToken extends sequelize_1.Model {
}
DownloadToken.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isUsed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
}, {
    sequelize: database_1.default,
    modelName: 'DownloadToken',
    tableName: 'download_tokens'
});
exports.default = DownloadToken;
//# sourceMappingURL=tokenModel.js.map