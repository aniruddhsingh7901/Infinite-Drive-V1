"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Book extends sequelize_1.Model {
}
Book.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        // defaultValue: () => `${Date.now()}-`, // This matches your format
        allowNull: false
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    formats: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: true,
    },
    filePaths: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('filePaths');
            return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
        },
        set(value) {
            this.setDataValue('filePaths', JSON.stringify(value));
        },
    },
    coverImagePaths: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'active',
    },
    bonuses: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('bonuses');
            return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
        },
        set(value) {
            this.setDataValue('bonuses', JSON.stringify(value));
        },
    },
}, {
    sequelize: database_1.default,
    modelName: 'Book',
    tableName: 'Books'
});
exports.default = Book;
//# sourceMappingURL=Book.js.map