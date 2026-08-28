import { desc, eq } from "drizzle-orm";
import { db } from "../db/db.ts";
import type { matchStatusEnum, NewMatch } from "../db/schema.ts";
import { match } from "../db/schema.ts";

export async function updateStatus(id: number, status: typeof matchStatusEnum.enumValues[number]) {
  try{
    await db.update(match).set({ status }).where(eq(match.id, id));
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createMatch(matchData: NewMatch) {
  try{
    const [newMatch] = await db.insert(match).values(matchData).returning();
    return newMatch;
  } catch (error) {
    console.error(error);
    return null;
  }
}  


export async function getAllMatches(limit: number, offset: number){
  try{
    const matches = await db.query.match.findMany({
      orderBy: [desc(match.createdAt)],
      limit,
      offset,
    });
    return matches;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getMatchById(id: number){
  try{
    const result = await db.query.match.findFirst({ where: eq(match.id, id) });
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}