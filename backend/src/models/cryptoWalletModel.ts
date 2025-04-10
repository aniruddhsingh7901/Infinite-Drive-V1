import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface CryptoWalletAttributes {
  id?: number;
  symbol: string;
  name: string;
  address: string;
  minConfirmations: number;
  processingTime: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CryptoWalletInput extends Omit<CryptoWalletAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
export interface CryptoWalletOutput extends Required<CryptoWalletAttributes> {}

class CryptoWallet extends Model<CryptoWalletAttributes, CryptoWalletInput> implements CryptoWalletAttributes {
  public id!: number;
  public symbol!: string;
  public name!: string;
  public address!: string;
  public minConfirmations!: number;
  public processingTime!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CryptoWallet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minConfirmations: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    processingTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
  },
  {
    sequelize,
    modelName: 'CryptoWallet',
    tableName: 'crypto_wallets',
  }
);

export default CryptoWallet;
