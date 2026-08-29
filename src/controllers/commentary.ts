import { listCommentariesQuerySchema, matchIdParamSchema } from "../validation/validation.ts";
import type { Request, Response } from "express";
import z from "zod";
import { createCommentary, getAllCommentaries } from "../dal/commentary.ts";
import { createCommentarySchema } from "../db/schema.ts";

export async function listCommentaries(req: Request, res: Response) {
    const validatedMatchId = await matchIdParamSchema.safeParseAsync(req.params);
    if(!validatedMatchId.success) {
      return res.status(400).json({message: 'Invalid data', errors: z.treeifyError(validatedMatchId.error) });
    }
    const matchId = validatedMatchId.data.matchId;

    const validatedData = await listCommentariesQuerySchema.safeParseAsync(req.query);
    if(!validatedData.success) {
      return res.status(400).json({message: 'Invalid data', errors: z.treeifyError(validatedData.error) });
    }
    
    const limit = validatedData.data.limit ?? 50;
    const offset = validatedData.data.offset ?? 0;
    
    try {
        const commentaries = await getAllCommentaries(matchId, limit, offset);
        res.json({ message: 'Commentaries List', commentaries });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to get commentaries', error: (error as Error).message });
    }
}

export async function createNewCommentary(req: Request, res: Response) {
    const validatedMatchId = await matchIdParamSchema.safeParseAsync(req.params);
    if(!validatedMatchId.success) {
      return res.status(400).json({message: 'Invalid data', errors: z.treeifyError(validatedMatchId.error) });
    }
    const matchId = validatedMatchId.data.matchId;

    const validatedData = await createCommentarySchema.safeParseAsync({...req.body, matchId});
    if(!validatedData.success) {
      return res.status(400).json({message: 'Invalid data', errors: z.treeifyError(validatedData.error) });
    }

    try {
        const newCommentary = await createCommentary({...validatedData.data, matchId});
        if(res.app.locals.broadcastCommentaryCreated && newCommentary) {
            res.app.locals.broadcastCommentaryCreated(matchId, newCommentary);
        }
        res.status(201).json({ message: 'Commentary Created', newCommentary });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create commentary', error: (error as Error).message });
    }
}