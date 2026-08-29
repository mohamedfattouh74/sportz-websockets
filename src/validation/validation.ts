import z from "zod"

export const listMatchesQuerySchema = z.object({
    limit: z.coerce.number().optional().default(50),
    offset: z.coerce.number().optional().default(0),
});

  
export const listCommentariesQuerySchema = z.object({
    limit: z.coerce.number().optional().default(50),
    offset: z.coerce.number().optional().default(0),
});

export const matchIdParamSchema = z.object({
    matchId: z.coerce.number().transform(Number),
});