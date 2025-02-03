import './App.css';
import {useEffect, useRef, useState} from "react";
import * as React from "react";

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
    const [color, setColor] = useState('#eeeeee');
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

        return () => {
            if (ws.current) {
                ws.current.close();
                console.log('Connection closed');
            }
        };
    }, []);

    const drawPixel = (ctx: CanvasRenderingContext2D, pixel: Pixel) => {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(pixel.x, pixel.y, 1, 1);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setPainting(true);
        sendPixel(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!painting) return;
        sendPixel(e);
    };

    const handleMouseUp = () => {
        setPainting(false);
    };

    const clearCanvas = () => {
        if (!wsCanvas.current) return;
        const ctx = wsCanvas.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, wsCanvas.current.width, wsCanvas.current.height);

        if (!ws.current) return;
        ws.current.send(JSON.stringify({ type: "CLEAR_CANVAS" }));
    };

    const sendPixel = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!wsCanvas.current || !ws.current) return;
        const rect = wsCanvas.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const pixel: Pixel = { x, y, color };
        drawPixel(wsCanvas.current.getContext('2d')!, pixel);
        ws.current.send(JSON.stringify({ type: "SET_PIXEL", payload: pixel }));
    };

    return (
        <>
            <div style={{ textAlign: "center" }}>
                <h1>Welcome to Beks's Canvas</h1>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
                <canvas
                    ref={wsCanvas}
                    width={300}
                    height={300}
                    style={{ border: "1px solid black", cursor: "crosshair", display: "block", margin: "10px auto" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                />
                <button onClick={clearCanvas}>Clear Canvas</button>
            </div>
        </>
    )
};

export default App;
