import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {WebSocket} from 'ws';

const app = express();
expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();

router.ws('/canvas', (ws, req) => {

});

app.use(router);

app.listen(port, () => {
    console.log(`Server listening ${port}`);
});