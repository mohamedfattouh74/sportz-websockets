import { Router } from 'express';
import { createNewMatch, listMatches } from '../controllers/matches.ts';

export const matchesRouter = Router();

matchesRouter.get('/', listMatches);

matchesRouter.post('/', createNewMatch );


export default matchesRouter;