"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = exports.changePassword = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = __importDefault(require("../models/userModel"));
dotenv_1.default.config();
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
const login = async (req, res, next) => {
    try {
        const { email, passwords } = req.body;
        console.log(req.body, "------------------");
        const user = await userModel_1.default.findOne({ where: { email } });
        console.log("🚀 ~ login ~ user:", user);
        if (!user || !(await bcrypt_1.default.compare(passwords, user.password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '6h' });
        console.log("🚀 ~ login ~ token:", token);
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const changePassword = async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        console.log("🚀 ~ changePassword ~ req.body:", req.body);
        if (!email || !oldPassword || !newPassword) {
            res.status(400).json({ message: 'Email, old password and new password are required' });
            return;
        }
        const user = await userModel_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isValidPassword = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Current password is incorrect' });
            return;
        }
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 10);
        await user.update({ password: hashedNewPassword });
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.changePassword = changePassword;
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