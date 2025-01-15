CREATE TABLE IF NOT EXISTS "challenges" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"difficulty" varchar(50) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"hints" text[]
);
