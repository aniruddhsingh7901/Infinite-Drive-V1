"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const BLOCKCYPHER_WS_URL = 'wss://socket.blockcypher.com/v1/btc/main';
class BlockCypherWebSocketService {
    constructor(webSocketService) {
        this.ws = new ws_1.default(BLOCKCYPHER_WS_URL);
        // this.blockchainService = blockchainService;
        this.webSocketService = webSocketService;
        this.ws.on('open', () => {
            console.log('Connected to BlockCypher WebSocket----');
        });
        this.ws.on('message', async (data) => {
            const message = JSON.parse(data.toString());
            console.log('Received message from BlockCypher:', message);
        });
        this.ws.on('close', () => {
            console.log('Disconnected from BlockCypher WebSocket');
        });
        this.ws.on('error', (error) => {
            console.error('BlockCypher WebSocket error:', error);
        });
    }
    subscribeToAddress(address) {
        const message = {
            event: 'unconfirmed-tx',
            address
        };
        this.ws.send(JSON.stringify(message));
    }
}
exports.default = BlockCypherWebSocketService;
//# sourceMappingURL=blockCypherService.js.map