import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../models/userModel';
import AuthToken from '../models/authTokenModel';
import { TokenType } from '../models/authTokenModel';

dotenv.config();

// Helper function to generate a random OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to generate a random token
const generateToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};


interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email, password } = req.body;
        console.log("🚀 ~ register ~ req.body:", req.body)
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.log("🚀 ~ register ~ error:", error)
        next(error);
    }
};

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

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, passwords } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(passwords, user.password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '6h' });

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Save the reset token to the AuthToken table
        await AuthToken.create({
            userId: user.id,
            token: resetToken,
            type: TokenType.PASSWORD_RESET,
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
    } catch (error) {
        next(error);
    }
};



export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const user = await User.findOne({ where: { email } });

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
        await AuthToken.create({
            userId: user.id,
            token: resetToken,
            type: TokenType.PASSWORD_RESET,
            isUsed: false,
            expiresAt
        });

        // Import email service
        const emailService = (await import('../services/emailService')).default;

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
        } else {
            res.status(200).json({
                message: 'Password reset instructions sent to your email'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token, newPassword } = req.body;
        console.log("🚀 ~ resetPassword ~ req.body:", req.body)
        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and new password are required' });
            return;
        }

        // Find the token in the database
        const resetToken = await AuthToken.findOne({
            where: {
                token,
                type: TokenType.PASSWORD_RESET,
                isUsed: false,
                expiresAt: { [Op.gt]: new Date() }
            }
        });

        if (!resetToken) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }

        // Find the user
        const user = await User.findByPk(resetToken.userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await user.update({ password: hashedPassword });

        // Mark the token as used
        await resetToken.update({ isUsed: true });

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const toggleOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const user = await User.findByPk(userId);

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
    } catch (error) {
        console.error('Toggle OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkAuth = (req: Request, res: Response): void => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("🚀 ~ checkAuth ~ token:", token)

    if (!token) {
        res.status(401).json({ isAuthenticated: false });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        res.status(200).json({ isAuthenticated: true, user: decoded });
    } catch (error) {
        res.status(401).json({ isAuthenticated: false });
    }
};
