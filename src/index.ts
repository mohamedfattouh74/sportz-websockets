import express, { type Express, type Request, type Response } from 'express';
import matchesRouter from './routes/matches.ts';
import http from 'http';
import { attachWebSocketServer } from './ws/server.ts';
import { commentaryRouter } from './routes/commentary.ts';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app: Express = express();

const server = http.createServer(app);

app.use(express.json());
const { broadcastMatchCreated, broadcastCommentaryCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentaryCreated = broadcastCommentaryCreated;


app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/matches', matchesRouter);
app.use('/matches/:matchId/commentaries', commentaryRouter);

server.listen(PORT, HOST,() => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(`WebSocket server is running on ${baseUrl.replace('http', 'ws')}/ws`);
});