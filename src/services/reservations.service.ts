import { reservations, seats } from "../db/schema.js";
import { db } from "../db/db.js";
import type { createReservationBody } from "../validation/schemas.js";
import { eq } from "drizzle-orm";
import { AppError } from "../types.js";

export class ReservationsService {
    async getReservations(){
        const list = await db.select().from(reservations)
        return list
    }

    async getReservation(){
        
    }

    async createReservation(userId: number, data: createReservationBody){
        const transaction = await db.transaction(async(tx) => {
            const [seat] = await tx.select().from(seats).where(eq(seats.id, data.seatId))
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

    async updateReservation(){
        
    }

     async removeReservation(){
        
    }
}