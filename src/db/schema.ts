import { integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';


export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'live', 'finished']);
  

export const Match = pgTable('matches', {
  id: serial('id').primaryKey(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  homeScore: integer('home_score').default(0).notNull(),
  awayScore: integer('away_score').default(0).notNull(),
  sport: text('sport').notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  status: matchStatusEnum('status').default('scheduled').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})


export const Commentary = pgTable('commentaries', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => Match.id).notNull(),
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