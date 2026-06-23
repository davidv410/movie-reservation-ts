import { reservations } from "../db/schema.js";
import { db } from "../db/db.js";

export class ReservationsService {
    async getReservations(){
        const list = await db.select().from(reservations)
        return list
    }

    async getReservation(){
        
    }

    async createReservation(){
        
    }

    async updateReservation(){
        
    }

     async removeReservation(){
        
    }
}