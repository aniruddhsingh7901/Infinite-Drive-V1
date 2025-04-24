import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export enum TokenType {
  PASSWORD_RESET = 'password_reset',
  OTP = 'otp'
}

class AuthToken extends Model {
  declare id: string;
  declare userId: number;
  declare token: string;
  declare type: TokenType;
  declare isUsed: boolean;
  declare expiresAt: Date;
}

AuthToken.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM(...Object.values(TokenType)),
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
},
{
  sequelize,
  modelName: 'AuthToken',
  tableName: 'auth_tokens'
});

export default AuthToken;
