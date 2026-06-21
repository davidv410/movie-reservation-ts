CREATE TYPE "public"."reservation_status" AS ENUM('confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."seat_type" AS ENUM('standard', 'premium', 'accessible');--> statement-breakpoint
CREATE TABLE "genres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	CONSTRAINT "genres_name_unique" UNIQUE("name"),
	CONSTRAINT "genres_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "movie_genres" (
	"movie_id" uuid NOT NULL,
	"genre_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"poster_url" varchar(500),
	"duration_minutes" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"showtime_id" uuid NOT NULL,
	"seat_id" uuid NOT NULL,
	"status" "reservation_status" DEFAULT 'confirmed' NOT NULL,
	"price_paid" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"showtime_id" uuid NOT NULL,
	"row" varchar(5) NOT NULL,
	"number" integer NOT NULL,
	"type" "seat_type" DEFAULT 'standard' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "showtimes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"movie_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"hall" varchar(50) NOT NULL,
	"total_seats" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_showtime_id_showtimes_id_fk" FOREIGN KEY ("showtime_id") REFERENCES "public"."showtimes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_seat_id_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."seats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_showtime_id_showtimes_id_fk" FOREIGN KEY ("showtime_id") REFERENCES "public"."showtimes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "movie_genres_pk" ON "movie_genres" USING btree ("movie_id","genre_id");--> statement-breakpoint
CREATE INDEX "movies_title_idx" ON "movies" USING btree ("title");--> statement-breakpoint
CREATE INDEX "movies_active_idx" ON "movies" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_seat_unique_idx" ON "reservations" USING btree ("seat_id","showtime_id");--> statement-breakpoint
CREATE INDEX "reservations_user_idx" ON "reservations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reservations_showtime_idx" ON "reservations" USING btree ("showtime_id");--> statement-breakpoint
CREATE INDEX "reservations_status_idx" ON "reservations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "seats_showtime_row_number_idx" ON "seats" USING btree ("showtime_id","row","number");--> statement-breakpoint
CREATE INDEX "seats_showtime_idx" ON "seats" USING btree ("showtime_id");--> statement-breakpoint
CREATE INDEX "seats_available_idx" ON "seats" USING btree ("showtime_id","is_available");--> statement-breakpoint
CREATE INDEX "showtimes_movie_idx" ON "showtimes" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "showtimes_starts_at_idx" ON "showtimes" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "showtimes_movie_date_idx" ON "showtimes" USING btree ("movie_id","starts_at");