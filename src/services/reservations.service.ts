import { movies, payments, reservations, seats, showtimes, users } from "../db/schema.js";
import { db } from "../db/db.js";
import type { createReservationBody } from "../validation/schemas.js";
import { eq, and, inArray } from "drizzle-orm";
import { AppError } from "../types.js";
import { cleanupQueue } from "./queues/cleanup.queue.js";
import { stripe } from "../lib/stripe.js";

export class ReservationsService {
    async getReservations(userId: string, role?: string){
        if(role && role === 'admin'){
            const list = await db.select({ 
                reservationId: reservations.id,
                reservationStatus: reservations.status,

                seatRow: seats.row,
                seatNumber: seats.number,
                seatPrice: seats.price,
                seatIsAvailable: seats.isAvailable,

                showtimeId: showtimes.id,
                startTime: showtimes.startsAt,

                movieTitle: movies.title,

                userId: users.id,
                userName: users.name,
                userEmail: users.email,
             })
            .from(reservations)
            .innerJoin(seats, eq(reservations.seatId, seats.id))
            .innerJoin(showtimes, (eq(reservations.showtimeId, showtimes.id)))
            .innerJoin(movies, eq(showtimes.movieId, movies.id))
            .innerJoin(users, (eq(reservations.userId, users.id)))
            return list
        }

        const list = await db.select({ 
            reservationId: reservations.id,
            reservationStatus: reservations.status,

            seatRow: seats.row,
            seatNumber: seats.number,
            seatPrice: seats.price,
            seatIsAvailable: seats.isAvailable,

            showtimeId: showtimes.id,
            startTime: showtimes.startsAt,

            movieTitle: movies.title,

            userId: users.id,
            userName: users.name,
            userEmail: users.email,
            })
        .from(reservations)
        .leftJoin(seats, eq(reservations.seatId, seats.id))
        .innerJoin(showtimes, (eq(reservations.showtimeId, showtimes.id)))
        .innerJoin(movies, eq(showtimes.movieId, movies.id))
        .innerJoin(users, (eq(reservations.userId, users.id)))
        .where(eq(reservations.userId, userId))
        return list
    }

    async getReservation(userId: string, reservationId: string){
        const [reservation] = await db.select().from(reservations).where(and(eq(reservations.userId, userId), eq(reservations.id, reservationId)))
        if(!reservation){ throw new AppError(404, "No reservation found") }
        return reservation
    }

    async createReservation(userId: string, userEmail: string, data: createReservationBody){
        const transaction = await db.transaction(async(tx) => {
            const waitingSeats = []
            for(const seatId of data.seatIds){
                const [seat] = await tx.select().from(seats).where(eq(seats.id, seatId)).orderBy(seats.id).for("update")
                if(!seat){ throw new AppError(404, "Seat not found") }
                if(!seat?.isAvailable){ throw new AppError(400, "Seat is not available") }
                waitingSeats.push(seat)
            }
            
            await tx.update(seats).set({ isAvailable: false }).where(inArray(seats.id, waitingSeats.map(s => s.id)))

            const totalAmount = waitingSeats.reduce((sum, seat) => sum + Number(seat.price), 0)
            const totalCents = Math.round(totalAmount * 100)

            const [payment] = await tx.insert(payments).values({
                    amount: totalAmount.toFixed(2),
                    currency: "eur",
            }).returning()

            const addedReservations = await tx.insert(reservations).values(waitingSeats.map(seat => ({
                userId,
                showtimeId: data.showtimeId,
                seatId: seat.id,
                pricePaid: seat.price,
                paymentId: payment!.id
            }))).returning()


            return { payment: payment, totalCents, reservations: addedReservations}
        })
    
        const paymentIntent = await stripe.paymentIntents.create({
            amount: transaction.totalCents,
            currency: "eur",
            metadata: { paymentId: transaction.payment!.id },
        })

        await db.update(payments).set({ stripePaymentId: paymentIntent.id }).where(eq(payments.id, transaction.payment!.id))

        cleanupQueue.add(
            "expire-pending-payment",
            { paymentId: transaction.payment!.id },
            { delay: 15 * 60 * 1000 }
        ).catch(err => console.error("Failed to schedule cleanup job:", err));
    
        return { reservations: transaction.reservations, clientSecret: paymentIntent.client_secret }
    }


     async removeReservation(userId: string, userEmail: string, reservationId: string){
        const [reservation] = await db.select().from(reservations).where(eq(reservations.id, reservationId))

        if(!reservation){
            throw new AppError(404, "Reservation not found")
        }

        if(reservation.status !== "confirmed"){
            throw new AppError(400, "Only confirmed reservations can be cancelled")
        }

         if (!reservation.paymentId) {
            throw new AppError(400, "Reservation doesnt have stripe payment id")
        }

        const [payment] = await db.select().from(payments).where(eq(payments.id, reservation.paymentId))

        if (!payment || !payment.stripePaymentId) {
            throw new AppError(400, "No payment found for this reservation");
        }

        await stripe.refunds.create({
            payment_intent: payment.stripePaymentId
        })

        return { message: "Refunded" }
    }
}