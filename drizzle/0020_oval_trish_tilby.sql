ALTER TABLE "user_progress" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "challenges" DROP COLUMN IF EXISTS "code";--> statement-breakpoint
ALTER TABLE "challenges" DROP COLUMN IF EXISTS "image_url";