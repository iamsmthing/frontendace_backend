ALTER TABLE "comments" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "post_tags" ALTER COLUMN "tag_id" SET DATA TYPE text;