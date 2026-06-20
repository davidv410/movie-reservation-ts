CREATE TYPE "public"."roles" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "roles" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"refresh_token" varchar(500),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
