import express from 'express';
import bodyParser from 'body-parser';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import { createServer } from 'http';
import WebSocketService from './services/websocketService';
import BlockCypherWebSocketService from './services/blockCypherService';
import paymentRoutes from './routes/paymentRoutes';
import bookRoutes from './routes/bookRoutes';
import downloadRoutes from './routes/downloadRoutes';
import webhookRoutes from './routes/webHookRoutes';
import contactRoutes from './routes/contactRoutes';
import sequelize from './config/database';
import './models';
import bcrypt from 'bcrypt';
import User from './models/userModel';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import cryptoWalletRoutes from './routes/cryptoWalletRoutes';
import trackVisitor from './middleware/visitorTracker';

const app = express();

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')), // Path to your SSL key
  cert: fs.readFileSync(path.join(__dirname, '../ssl/server.cert'))
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
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser()); // Required for visitor tracking cookies
app.use(trackVisitor); // Add visitor tracking middleware

const server = createServer(app);
const webSocketService = new WebSocketService(server);
const blockCypherWebSocketService = new BlockCypherWebSocketService(webSocketService);

// Routes
app.use('/auth', authRoutes);
app.use('/payment', paymentRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/books', bookRoutes);
app.use('/orders', orderRoutes);
app.use('/download', downloadRoutes);
app.use('/admin', adminRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/api', cryptoWalletRoutes);
app.use('/contact', contactRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Create admin user function
const createAdminUser = async () => {
  try {
    const email = 'admin@example.com';
    const password = 'adminpassword';
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: { email, password: hashedPassword, role: 'admin' }
    });

    if (created) {
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

const PORT = process.env.PORT || 5002;
const HTTPS_PORT = process.env.HTTPS_PORT || 5003;
console.log(`Using port: ${PORT}`);

sequelize.authenticate()
  .then(async () => {
    console.log('Database connected...');
    await sequelize.sync(); // Remove alter: true to avoid modifying existing tables
    console.log('Database synchronized');
    await createAdminUser();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
     console.log(`Environment: ${process.env.NODE_ENV}`);
   });
    // Create HTTPS server
    https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
      console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
    });

  })
  .catch((err: any) => {
    console.error('Unable to connect to the database:', err);
  });

export { webSocketService };
