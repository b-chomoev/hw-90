import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {WebSocket} from 'ws';

const app = express();
expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();
const connectedClients: WebSocket[] = [];

interface Pixel {
    x: number;
    y: number;
    color: string;
}

interface IncomingPixelMessage {
    type: string;
    payload: Pixel;
}

let canvas: Pixel[] = [];

router.ws('/canvas', (ws, req) => {
    connectedClients.push(ws);
    console.log('Client connected. Client total - ', connectedClients.length);

    ws.send(JSON.stringify({type: 'CANVAS_STATE', payload: canvas,}));

    ws.on('message', (message) => {
        try {
            const decodedMessage = JSON.parse(message.toString()) as IncomingPixelMessage;

            if (decodedMessage.type === 'SET_PIXEL') {
                canvas.push(decodedMessage.payload);

                connectedClients.forEach(clientWS => {
                    clientWS.send(JSON.stringify({
                        type: 'NEW_PIXEL',
                        payload: decodedMessage.payload,
                    }));
                });
            }
        } catch (error) {
            ws.send(JSON.stringify({error: "Invalid message format"}));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const index = connectedClients.indexOf(ws);
        connectedClients.splice(index, 1);
    });
});

app.use(router);

app.listen(port, () => {
    console.log(`Server listening ${port}`);
});