import './App.css';
import {useEffect, useRef, useState} from "react";

interface Pixel {
    x: number;
    y: number;
    color: string;
}

interface IncomingPixelMessage {
    type: string;
    payload: Pixel | Pixel[];
}

const App = () => {
    const wsCanvas = useRef<HTMLCanvasElement | null>(null);
    const ws = useRef<WebSocket | null>(null);
    const [color, setColor] = useState('#000000');
    const [painting, setPainting] = useState(false);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/canvas');

        ws.current.onclose = () => console.log('Connection closed');

        ws.current.onmessage = (e) => {
            const decodedMessage = JSON.parse(e.data) as IncomingPixelMessage;

            if (decodedMessage.type === 'CANVAS_STATE') {
                const canvas = wsCanvas.current;
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                (decodedMessage.payload as Pixel[]).forEach(pixel => {
                    ctx.fillStyle = pixel.color;
                    ctx.fillRect(pixel.x, pixel.y, 1, 1);
                });
            } else if (decodedMessage.type === 'NEW_PIXEL') {
                const canvas = wsCanvas.current;
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.fillStyle = (decodedMessage.payload as Pixel).color;
                ctx.fillRect((decodedMessage.payload as Pixel).x, (decodedMessage.payload as Pixel).y, 1, 1);
            }
        };

    }, []);

    return (
        <>

        </>
    )
};

export default App
