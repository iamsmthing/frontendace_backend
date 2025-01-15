ALTER TABLE "comments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "parent_comment_id" SET DATA TYPE text;