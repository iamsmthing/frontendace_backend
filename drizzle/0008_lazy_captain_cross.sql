ALTER TABLE "comments" ALTER COLUMN "parent_comment_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "post_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "post_tags" ALTER COLUMN "post_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "post_tags" ALTER COLUMN "tag_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "upvotes" ALTER COLUMN "post_id" SET DATA TYPE uuid;