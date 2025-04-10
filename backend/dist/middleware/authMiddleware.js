"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticate = (req, res, next) => {
    console.log('Authentication middleware called');
    console.log('Headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        console.log('Verifying token:', token);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('Token verified, decoded:', decoded);
        req.user = decoded;
        next();
    }
    catch (ex) {
        console.log('Invalid token:', ex);
        res.status(400).json({ message: 'Invalid token.' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authMiddleware.js.map