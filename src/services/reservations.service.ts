import { reservations, seats } from "../db/schema.js";
import { db } from "../db/db.js";
import type { createReservationBody } from "../validation/schemas.js";
import { eq, and } from "drizzle-orm";
import { AppError } from "../types.js";

export class ReservationsService {
    async getReservations(userId: number){
        const list = await db.select().from(reservations).where(eq(reservations.userId, userId))
        return list
    }

    async getReservation(userId: number, reservationId: string){
        const [reservation] = await db.select().from(reservations).where(and(eq(reservations.userId, userId), eq(reservations.id, reservationId)))
        if(!reservation){ throw new AppError(404, "No reservation found") }
        return reservation
    }

    async createReservation(userId: number, data: createReservationBody){
        const transaction = await db.transaction(async(tx) => {
            const [seat] = await tx.select().from(seats).where(eq(seats.id, data.seatId)).for("update")
            if(!seat){ throw new AppError(404, "Seat not found") }
            if(!seat?.isAvailable){ throw new AppError(400, "Seat is not available") }
    
            await tx.update(seats).set({ isAvailable: false }).where(eq(seats.id, seat.id))
    
            const [reservation] = await tx.insert(reservations).values({
                userId,
                ...data,
                pricePaid: seat.price
            }).returning()
    
            return { reservation }
        })

        return { reservation: transaction.reservation }
    }


     async removeReservation(userId: number, reservationId: string){
        const [reservation] = await db.select().from(reservations)
        .where(and(eq(reservations.id, reservationId), eq(reservations.userId, userId)));

        if (!reservation) throw new AppError(404, "Reservation not found");
        if (reservation.status === "cancelled") throw new AppError(400, "Reservation already cancelled");

        const [cancelled] = await db.update(reservations).set({ status: "cancelled", cancelledAt: new Date() }).where(and(eq(reservations.userId, userId), eq(reservations.id, reservationId))).returning()

        await db.update(seats).set({ isAvailable: true }).where(eq(seats.id, reservation.seatId))

        return cancelled
    }
}