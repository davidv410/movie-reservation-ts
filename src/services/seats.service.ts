import {db} from "../db/db.js";
import {eq} from "drizzle-orm";
import {seats} from "../db/schema.js";

export class SeatsService {
    async findSeats (id: string) {
        const showtimeSeats = await db.select().from(seats).where(eq(seats.showtimeId, id))
        if(showtimeSeats.length === 0) return []
        return showtimeSeats
    }
}