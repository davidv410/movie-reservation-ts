import { eq, and } from "drizzle-orm"
import { db } from "../db/db.js"
import { reservations, showtimes } from "../db/schema.js"
import { AppError } from "../types.js"

export class AdminService{
    async getReservations(){
        const list = await db.select().from(reservations)
        return list
    }

    async getShowtimeReservations(showtimeId: string){
        const list = await db.select().from(reservations).where(eq(reservations.showtimeId, showtimeId))

        return list
    }

    async getShowtimeReport(movieId: string){

        const movieShowtimes = await db.select().from(showtimes).where(eq(showtimes.movieId, movieId))

        if (movieShowtimes.length === 0) return [];

         const report = await Promise.all( movieShowtimes.map(async (showtime) => {
            const movieReservations = await db.select().from(reservations).where(and(eq(reservations.showtimeId, showtime.id), eq(reservations.status, "confirmed")))

            const revenue = movieReservations.reduce((sum, r) => sum + Number(r.pricePaid), 0);

             return {
                showtimeId: showtime.id,
                hall: showtime.hall,
                startsAt: showtime.startsAt,
                totalSeats: showtime.totalSeats,
                seatsTaken: movieReservations.length,
                seatsAvailable: showtime.totalSeats - movieReservations.length,
                revenue,
            };
        }))

        return report
    }
}