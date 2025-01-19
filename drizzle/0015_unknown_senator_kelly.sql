ALTER TABLE "users" ADD COLUMN "score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "weekly_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "monthly_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_score_idx" ON "users" ("score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_weekly_score_idx" ON "users" ("weekly_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_monthly_score_idx" ON "users" ("monthly_score");