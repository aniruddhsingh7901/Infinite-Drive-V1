import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/userModel';

dotenv.config();


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

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, passwords } = req.body;
        console.log(req.body, "------------------")
        const user = await User.findOne({ where: { email } });
        console.log("🚀 ~ login ~ user:", user)
        if (!user || !(await bcrypt.compare(passwords, user.password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '6h' });
        console.log("🚀 ~ login ~ token:", token)
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};



export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        console.log("🚀 ~ changePassword ~ req.body:", req.body)
        if (!email || !oldPassword || !newPassword) {
            res.status(400).json({ message: 'Email, old password and new password are required' });
            return;
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isValidPassword = await bcrypt.compare(oldPassword, user.password);

        if (!isValidPassword) {
            res.status(401).json({ message: 'Current password is incorrect' });
            return;
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedNewPassword });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
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