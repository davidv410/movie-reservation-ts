import { eq } from "drizzle-orm"
import { db } from "../db/db.js"
import { reservations } from "../db/schema.js"
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
}