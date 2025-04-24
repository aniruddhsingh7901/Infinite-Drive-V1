import { Server } from 'http';
import WebSocket from 'ws';

class WebSocketService {
    private wss: WebSocket.Server;
    private adminClients: Set<WebSocket>;

    constructor(server: Server) {
        this.wss = new WebSocket.Server({ server });
        this.adminClients = new Set();

        this.wss.on('connection', (ws: WebSocket, req: any) => {
            console.log('New client connected');
            
            // Check if this is an admin connection
            const url = new URL(req.url, `http://${req.headers.host}`);
            if (url.pathname === '/ws/admin') {
                this.adminClients.add(ws);
                console.log('Admin client connected');
            }

            ws.on('message', (message: string) => {
                try {
                    const parsedMessage = JSON.parse(message.toString());
                    console.log('Received message:', parsedMessage);
                    
                    // Handle client authentication or other messages
                    if (parsedMessage.type === 'auth' && parsedMessage.role === 'admin') {
                        this.adminClients.add(ws);
                        console.log('Admin client authenticated');
                    }
                } catch (e) {
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

    broadcast(event: string, data: any) {
        const message = JSON.stringify({ event, data });
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
    
    broadcastToAdmin(event: string, data: any) {
        const message = JSON.stringify({ event, data });
        this.adminClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
    
    broadcastOrderUpdate(order: any) {
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

export default WebSocketService;
