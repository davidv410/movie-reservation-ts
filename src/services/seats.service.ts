import {db} from "../db/db.js";
import {eq} from "drizzle-orm";
import {seats} from "../db/schema.js";
import { redis } from "../lib/redis.js";

export class SeatsService {
    async findSeats (id: string) {
        const key = `showtimeSeats:${id}`

        const cached = await redis.get(key)
        if(cached) return cached
        
        const showtimeSeats = await db.select().from(seats).where(eq(seats.showtimeId, id))

        await redis.set(key, JSON.stringify(showtimeSeats), { ex: 60 * 60 })

        return showtimeSeats
    }
}