"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let sequelizeInstance = null;
const createConnection = () => {
    if (!sequelizeInstance) {
        console.log('Initializing new database connection...');
        sequelizeInstance = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: false, // Disable verbose logging
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        });
        // Test connection once
        sequelizeInstance.authenticate()
            .then(() => {
            console.log('Database connection established successfully');
        })
            .catch(err => {
            console.error('Database connection failed:', err);
            sequelizeInstance = null;
        });
    }
    return sequelizeInstance;
};
exports.default = createConnection();
//# sourceMappingURL=database.js.map