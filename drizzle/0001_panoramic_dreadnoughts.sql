ALTER TABLE "commentaries" ALTER COLUMN "period" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "start_time" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "start_time" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "end_time" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "end_time" SET NOT NULL;