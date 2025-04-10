"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class WebSocketService {
    constructor(server) {
        this.wss = new ws_1.default.Server({ server });
        this.wss.on('connection', (ws) => {
            console.log('New client connected');
            ws.on('message', (message) => {
                console.log('Received message:', message);
            });
            ws.on('close', () => {
                console.log('Client disconnected');
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
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
}
exports.default = WebSocketService;
//# sourceMappingURL=websocketService.js.map