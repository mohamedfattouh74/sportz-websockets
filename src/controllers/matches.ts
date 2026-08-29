import { createMatch, getAllMatches } from "../dal/match.ts";
import { createMatchSchema } from "../db/schema.ts";
import { getMatchStatus } from "../utils/match-status.ts";
import { listMatchesQuerySchema } from "../validation/validation.ts";
import type { Request, Response } from "express";
import z from "zod";

export async function listMatches(req: Request, res: Response) {
    const validatedData = await listMatchesQuerySchema.safeParseAsync(req.query);
    if(!validatedData.success) {
      return res.status(400).json({message: 'Invalid data', errors: z.treeifyError(validatedData.error) });
    }
  
    const limit = validatedData.data.limit ?? 50;
    const offset = validatedData.data.offset ?? 0;
  
    try{
      const matches = await getAllMatches(limit, offset);
      res.json({ message: 'Matches List', matches });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get matches', error: (error as Error).message });
    }
  }


export async function createNewMatch(req: Request, res: Response) {
    const validatedData = await createMatchSchema.safeParseAsync(req.body);
    
    if(!validatedData.success) {
      return res.status(400).json({message: 'Invalid data', errors: z.treeifyError(validatedData.error) });
    }
    
    try{
      const match = await createMatch({...validatedData.data, status: getMatchStatus(validatedData.data.startTime, validatedData.data.endTime)});
      if(res.app.locals.broadcastMatchCreated && match) {
        res.app.locals.broadcastMatchCreated(match);
      }
      res.status(201).json({ message: 'Match Created', match });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }   
}