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
exports.webSocketService = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const http_1 = require("http");
const websocketService_1 = __importDefault(require("./services/websocketService"));
const blockCypherService_1 = __importDefault(require("./services/blockCypherService"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const bookRoutes_1 = __importDefault(require("./routes/bookRoutes"));
const downloadRoutes_1 = __importDefault(require("./routes/downloadRoutes"));
const webHookRoutes_1 = __importDefault(require("./routes/webHookRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const database_1 = __importDefault(require("./config/database"));
require("./models");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const userModel_1 = __importDefault(require("./models/userModel"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const purchaseRoutes_1 = __importDefault(require("./routes/purchaseRoutes"));
const cryptoWalletRoutes_1 = __importDefault(require("./routes/cryptoWalletRoutes"));
const visitorTracker_1 = __importDefault(require("./middleware/visitorTracker"));
const app = (0, express_1.default)();
const sslOptions = {
    key: fs_1.default.readFileSync(path_1.default.join(__dirname, '../ssl/server.key')), // Path to your SSL key
    cert: fs_1.default.readFileSync(path_1.default.join(__dirname, '../ssl/server.cert'))
};
// CORS configuration
const corsOptions = {
    origin: ['https://infinitedriven.com', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Access-Control-Allow-Headers',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'Health is ok.',
        uptime: process.uptime(),
        timestamp: Date.now(),
    });
});
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)()); // Required for visitor tracking cookies
app.use(visitorTracker_1.default); // Add visitor tracking middleware
const server = (0, http_1.createServer)(app);
const webSocketService = new websocketService_1.default(server);
exports.webSocketService = webSocketService;
const blockCypherWebSocketService = new blockCypherService_1.default(webSocketService);
// Routes
app.use('/auth', authRoutes_1.default);
app.use('/payment', paymentRoutes_1.default);
app.use('/webhooks', webHookRoutes_1.default);
app.use('/books', bookRoutes_1.default);
app.use('/orders', orderRoutes_1.default);
app.use('/download', downloadRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
app.use('/purchase', purchaseRoutes_1.default);
app.use('/api', cryptoWalletRoutes_1.default);
app.use('/contact', contactRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'An error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Create admin user function
const createAdminUser = async () => {
    try {
        const adminEmail = 'brajdhakad0@gmail.com';
        // Check if admin user already exists
        const existingAdmin = await userModel_1.default.findOne({ where: { email: adminEmail } });
        if (existingAdmin) {
            console.log('Admin user already exists');
        }
        else {
            // Generate a secure random password
            const tempPassword = crypto_1.default.randomBytes(16).toString('hex');
            console.log(`Generated temporary password: ${tempPassword}`);
            const hashedPassword = await bcrypt_1.default.hash(tempPassword, 10);
            // Create admin user
            const newAdmin = await userModel_1.default.create({
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            });
            console.log('Admin user created successfully');
        }
    }
    catch (error) {
        console.error('Error creating admin user:', error);
    }
};
const PORT = process.env.PORT || 5002;
const HTTPS_PORT = process.env.HTTPS_PORT || 5003;
console.log(`Using port: ${PORT}`);
database_1.default.authenticate()
    .then(async () => {
    console.log('Database connected...');
    // Import models and initialize associations
    const { initializeModels } = await Promise.resolve().then(() => __importStar(require('./models/index')));
    // Use the initializeModels function instead of directly calling sequelize.sync
    await initializeModels();
    console.log('Database synchronized without schema changes');
    await createAdminUser();
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
    });
    // Create HTTPS server
    https_1.default.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
        console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
    });
})
    .catch((err) => {
    console.error('Unable to connect to the database:', err);
});
//# sourceMappingURL=app.js.map