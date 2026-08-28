import express, { type Express, type Request, type Response } from 'express';
import matchesRouter from './routes/matches.ts';

const app: Express = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/matches', matchesRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});