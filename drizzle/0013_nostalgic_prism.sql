ALTER TABLE "comments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "upvotes" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "upvotes" ALTER COLUMN "id" DROP DEFAULT;