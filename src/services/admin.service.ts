import { db } from "../db/db.js"
import { reservations } from "../db/schema.js"

export class AdminService{
    async getReservations(){
        const list = await db.select().from(reservations)
        return list
    }
}