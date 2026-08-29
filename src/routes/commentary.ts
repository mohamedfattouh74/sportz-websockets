import { Router } from "express";
import { createNewCommentary, listCommentaries } from "../controllers/commentary.ts";

export const commentaryRouter = Router({ mergeParams: true });


commentaryRouter.get('/', listCommentaries);
commentaryRouter.post('/', createNewCommentary);