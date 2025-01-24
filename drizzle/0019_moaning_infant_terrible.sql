CREATE TABLE IF NOT EXISTS "peer_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"challenge_id" text NOT NULL,
	"reviewer_id" text NOT NULL,
	"user_progress_id" text NOT NULL,
	"comment" text,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peer_reviews" ADD CONSTRAINT "peer_reviews_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peer_reviews" ADD CONSTRAINT "peer_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peer_reviews" ADD CONSTRAINT "peer_reviews_user_progress_id_user_progress_id_fk" FOREIGN KEY ("user_progress_id") REFERENCES "user_progress"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
