import { Sequelize } from 'sequelize';
import { Dialect } from 'sequelize/types';
import dotenv from 'dotenv';

dotenv.config();

let sequelizeInstance: Sequelize | null = null;

const createConnection = () => {
  if (!sequelizeInstance) {
    console.log('Initializing new database connection...');

    sequelizeInstance = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
      host: process.env.DB_HOST,
      dialect: 'postgres' as Dialect,
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

export default createConnection();