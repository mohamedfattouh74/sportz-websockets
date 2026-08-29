import { desc, eq } from "drizzle-orm";
import { db } from "../db/db.ts";
import { commentary, type NewCommentary } from "../db/schema.ts";

export async function getAllCommentaries(matchId: number, limit: number, offset: number) {
    try {
    const commentaries = await db.query.commentary.findMany({
        where: eq(commentary.matchId, matchId),
        limit,
        offset,
        orderBy: [desc(commentary.createdAt)],
        });
        return commentaries;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to get commentaries', { cause: error });
    }
}


export async function createCommentary(newCommentary: NewCommentary) {
    try {
        const [newCommentaryResult] = await db.insert(commentary).values(newCommentary).returning();
        return newCommentaryResult;
    }
    catch (error) {
        console.error(error);
        throw new Error('Failed to create commentary', { cause: error });
    }
}