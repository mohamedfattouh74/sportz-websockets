import { integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';


export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'live', 'finished']);
  
export const match = pgTable('matches', {
  id: serial('id').primaryKey(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  homeScore: integer('home_score').default(0).notNull(),
  awayScore: integer('away_score').default(0).notNull(),
  sport: text('sport').notNull(),
  startTime: timestamp('start_time', {withTimezone: true}).notNull(),
  endTime: timestamp('end_time', {withTimezone: true}).notNull(),
  status: matchStatusEnum('status').default('scheduled').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})


export const commentary = pgTable('commentaries', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => match.id).notNull(),
  minute: integer('minute').notNull(),
  sequence: integer('sequence').notNull(),
  period: integer('period').notNull(),
  eventType: text('event_type').notNull(),
  actor: text('actor').notNull(),
  team: text('team').notNull(),
  message: text('message').notNull(),
  metadata : jsonb('metadata').notNull(),
  tags : text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})


export const createMatchSchema = createInsertSchema(match, 
  {
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
}).refine((data) => data.startTime < data.endTime, {
  message: 'endTime must be greater than startTime',
  path: ['endTime'],
})
export const selectMatchSchema = createSelectSchema(match)
export const updateMatchSchema = createUpdateSchema(match, 
  {
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  }).refine(
  (data) => {
    // Only validate when both are provided
    if (!data.startTime || !data.endTime) return true;

    return data.endTime > data.startTime;
  },
  {
    message: 'endTime must be greater than startTime',
    path: ['endTime'],
  }
);

export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().optional().default(50),
  offset: z.coerce.number().optional().default(0),
})

export type Match = z.infer<typeof selectMatchSchema>
export type NewMatch = z.infer<typeof createMatchSchema>
export type MatchUpdate = z.infer<typeof updateMatchSchema>


export const schema = { match, commentary }