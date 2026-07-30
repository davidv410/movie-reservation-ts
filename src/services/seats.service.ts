import {db} from "../db/db.js";
import {eq} from "drizzle-orm";
import {seats} from "../db/schema.js";
import { redis } from "../lib/redis.js";

export class SeatsService {
    async findSeats (id: string) {
        const showtimeSeats = await db.select().from(seats).where(eq(seats.showtimeId, id))
        return showtimeSeats
    }
}