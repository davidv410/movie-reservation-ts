import { movies, reservations, seats, showtimes, users } from "../db/schema.js";
import { db } from "../db/db.js";
import type { createReservationBody } from "../validation/schemas.js";
import { eq, and, inArray } from "drizzle-orm";
import { AppError } from "../types.js";
import { sendEmailSeatConfirmation, sendEmailSeatCancellation } from "./emailNotifications.service.js";

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
                const [seat] = await tx.select().from(seats).where(eq(seats.id, seatId)).for("update")
                if(!seat){ throw new AppError(404, "Seat not found") }
                if(!seat?.isAvailable){ throw new AppError(400, "Seat is not available") }
                waitingSeats.push(seat)
            }
            
            await tx.update(seats).set({ isAvailable: false }).where(inArray(seats.id, waitingSeats.map(s => s.id)))

            const addedReservations = await tx.insert(reservations).values(waitingSeats.map(seat => ({
                userId,
                showtimeId: data.showtimeId,
                seatId: seat.id,
                pricePaid: seat.price
            }))).returning()

            const [movieShowtimeInfo] = await tx.select({
                    startsAt: showtimes.startsAt,
                    movieTitle: movies.title,
            })
            .from(showtimes)
            .innerJoin(movies, eq(showtimes.movieId, movies.id))
            .where(eq(showtimes.id, data.showtimeId))

            if (!movieShowtimeInfo) {
                throw new AppError(404, "Showtime not found")
            }

            return { reservation: addedReservations, seats: waitingSeats, movieShowtimeInfo: movieShowtimeInfo }
        })

        sendEmailSeatConfirmation({userEmail, movieTitle: transaction.movieShowtimeInfo.movieTitle, startsAt: transaction.movieShowtimeInfo.startsAt, seats: transaction.seats.map(s => `${s.row}${s.number}`)})
        return { reservation: transaction.reservation }
    }


     async removeReservation(userId: string, userEmail: string, reservationId: string){
        const [reservation] = await db.select({
            reservationStatus: reservations.status,
            movieTitle: movies.title,
            startsAt: showtimes.startsAt,
            seatId: seats.id,
            seatRow: seats.row,
            seatNumber: seats.number
        }).from(reservations)
        .innerJoin(showtimes, eq(reservations.showtimeId, showtimes.id))
        .innerJoin(seats, eq(reservations.seatId, seats.id))
        .innerJoin(movies, eq(showtimes.movieId, movies.id))
        .where(and(eq(reservations.id, reservationId), eq(reservations.userId, userId)));

        if (!reservation) throw new AppError(404, "Reservation not found");
        if (reservation.reservationStatus === "cancelled") throw new AppError(400, "Reservation already cancelled");

        const [cancelled] = await db.update(reservations)
        .set({ status: "cancelled", cancelledAt: new Date() })
        .where(and(eq(reservations.userId, userId), eq(reservations.id, reservationId))).returning()

        await db.update(seats).set({ isAvailable: true }).where(eq(seats.id, reservation.seatId))

        sendEmailSeatCancellation({userEmail, movieTitle: reservation.movieTitle, startsAt: reservation.startsAt, seat: `${reservation.seatRow}${reservation.seatNumber}`})

        return cancelled
    }
}