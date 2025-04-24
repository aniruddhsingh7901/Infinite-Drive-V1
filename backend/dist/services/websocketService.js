"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class WebSocketService {
    constructor(server) {
        this.wss = new ws_1.default.Server({ server });
        this.adminClients = new Set();
        this.wss.on('connection', (ws, req) => {
            console.log('New client connected');
            // Check if this is an admin connection
            const url = new URL(req.url, `http://${req.headers.host}`);
            if (url.pathname === '/ws/admin') {
                this.adminClients.add(ws);
                console.log('Admin client connected');
            }
            ws.on('message', (message) => {
                try {
                    const parsedMessage = JSON.parse(message.toString());
                    console.log('Received message:', parsedMessage);
                    // Handle client authentication or other messages
                    if (parsedMessage.type === 'auth' && parsedMessage.role === 'admin') {
                        this.adminClients.add(ws);
                        console.log('Admin client authenticated');
                    }
                }
                catch (e) {
                    console.error('Error parsing message:', e);
                }
            });
            ws.on('close', () => {
                this.adminClients.delete(ws);
                console.log('Client disconnected');
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.adminClients.delete(ws);
            });
        });
    }
    broadcast(event, data) {
        const message = JSON.stringify({ event, data });
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(message);
            }
        });
    }
    broadcastToAdmin(event, data) {
        const message = JSON.stringify({ event, data });
        this.adminClients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(message);
            }
        });
    }
    broadcastOrderUpdate(order) {
        this.broadcastToAdmin('order_update', {
            id: order.id,
            status: order.status,
            email: order.email,
            bookId: order.bookId,
            amount: order.amount,
            updatedAt: new Date()
        });
    }
    broadcastDashboardUpdate() {
        this.broadcastToAdmin('dashboard_update', {
            timestamp: new Date()
        });
    }
}
exports.default = WebSocketService;
//# sourceMappingURL=websocketService.js.map