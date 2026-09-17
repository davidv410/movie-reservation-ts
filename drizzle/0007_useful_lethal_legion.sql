ALTER TABLE "payments" DROP CONSTRAINT "payments_reservation_id_reservations_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "stripe_payment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "payment_id" uuid;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "reservation_id";