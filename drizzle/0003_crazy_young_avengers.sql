ALTER TABLE "user_progress" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_progress" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_progress" ALTER COLUMN "user_id" SET DATA TYPE text;