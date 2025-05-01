"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = exports.toggleOTP = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const sequelize_1 = require("sequelize");
const userModel_1 = __importDefault(require("../models/userModel"));
const authTokenModel_1 = __importDefault(require("../models/authTokenModel"));
const authTokenModel_2 = require("../models/authTokenModel");
dotenv_1.default.config();
// Helper function to generate a random OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Helper function to generate a random token
const generateToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        console.log("🚀 ~ register ~ req.body:", req.body);
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await userModel_1.default.create({ username, email, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully', user });
    }
    catch (error) {
        console.log("🚀 ~ register ~ error:", error);
        next(error);
    }
};
exports.register = register;
// export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const { email, passwords, otp } = req.body;
//         console.log(req.body, "------------------")
//         const user = await User.findOne({ where: { email } });
//         console.log("🚀 ~ login ~ user:", user)
//         if (!user) {
//             res.status(401).json({ message: 'Invalid email or password' });
//             return;
//         }
//         // First verify password
//         if (!(await bcrypt.compare(passwords, user.password))) {
//             res.status(401).json({ message: 'Invalid email or password' });
//             return;
//         }
//         // Generate JWT token
//         const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '6h' });
//         console.log("🚀 ~ login ~ token:", token)
//         res.json({
//             message: 'Login successful',
//             token,
//             user: {
//                 id: user.id,
//                 email: user.email,
//                 role: user.role
//             }
//         });
//     } catch (error) {
//         next(error);
//     }
// };
const login = async (req, res, next) => {
    try {
        const { email, passwords } = req.body;
        const user = await userModel_1.default.findOne({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(passwords, user.password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '6h' });
        // Generate a reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        // Save the reset token to the AuthToken table
        await authTokenModel_1.default.create({
            userId: user.id,
            token: resetToken,
            type: authTokenModel_2.TokenType.PASSWORD_RESET,
            isUsed: false,
            expiresAt,
        });
        res.json({
            message: 'Login successful',
            token,
            resetToken, // Return the reset token to the frontend
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        const user = await userModel_1.default.findOne({ where: { email } });
        if (!user) {
            // Don't reveal that the user doesn't exist for security reasons
            res.status(200).json({ message: 'You are not the admin provide admin email address' });
            return;
        }
        // Generate a reset token
        const resetToken = generateToken();
        // Calculate expiry (1 hour from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        // Save token to database
        await authTokenModel_1.default.create({
            userId: user.id,
            token: resetToken,
            type: authTokenModel_2.TokenType.PASSWORD_RESET,
            isUsed: false,
            expiresAt
        });
        // Import email service
        const emailService = (await Promise.resolve().then(() => __importStar(require('../services/emailService')))).default;
        // Send password reset email
        const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);
        // For development/testing environments, also return the token in the response
        if (process.env.NODE_ENV === 'development') {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;
            res.status(200).json({
                message: 'Password reset instructions sent to your email',
                resetToken: resetToken, // Only included in development mode
                resetUrl: resetUrl // Only included in development mode
            });
        }
        else {
            res.status(200).json({
                message: 'Password reset instructions sent to your email'
            });
        }
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        console.log("🚀 ~ resetPassword ~ req.body:", req.body);
        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and new password are required' });
            return;
        }
        // Find the token in the database
        const resetToken = await authTokenModel_1.default.findOne({
            where: {
                token,
                type: authTokenModel_2.TokenType.PASSWORD_RESET,
                isUsed: false,
                expiresAt: { [sequelize_1.Op.gt]: new Date() }
            }
        });
        if (!resetToken) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }
        // Find the user
        const user = await userModel_1.default.findByPk(resetToken.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Hash the new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Update the user's password
        await user.update({ password: hashedPassword });
        // Mark the token as used
        await resetToken.update({ isUsed: true });
        res.status(200).json({ message: 'Password reset successful' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.resetPassword = resetPassword;
const toggleOTP = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await userModel_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Toggle OTP status
        await user.update({ otpEnabled: !user.otpEnabled });
        res.status(200).json({
            message: user.otpEnabled ? 'OTP authentication enabled' : 'OTP authentication disabled',
            otpEnabled: user.otpEnabled
        });
    }
    catch (error) {
        console.error('Toggle OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.toggleOTP = toggleOTP;
const checkAuth = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("🚀 ~ checkAuth ~ token:", token);
    if (!token) {
        res.status(401).json({ isAuthenticated: false });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ isAuthenticated: true, user: decoded });
    }
    catch (error) {
        res.status(401).json({ isAuthenticated: false });
    }
};
exports.checkAuth = checkAuth;
//# sourceMappingURL=authController.js.map