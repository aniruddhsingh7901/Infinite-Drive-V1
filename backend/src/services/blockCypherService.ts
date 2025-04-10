import WebSocket from 'ws';
import WebSocketService from './websocketService';



const BLOCKCYPHER_WS_URL = 'wss://socket.blockcypher.com/v1/btc/main';

class BlockCypherWebSocketService {
    private ws: WebSocket;
    // private blockchainService: BlockchainService;
    private webSocketService: WebSocketService;

    constructor(webSocketService: WebSocketService) {
        this.ws = new WebSocket(BLOCKCYPHER_WS_URL);
        
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

    subscribeToAddress(address: string) {
        const message = {
            event: 'unconfirmed-tx',
            address
        };
        this.ws.send(JSON.stringify(message));
    }
}

export default BlockCypherWebSocketService;
