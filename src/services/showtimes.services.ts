import { and, eq, lt, gt, or, gte, lte } from "drizzle-orm";
import { db } from "../db/db.js";
import { showtimes } from "../db/schema.js";
import type { createShowtimeBody, updateShowtimeBody } from "../validation/schemas.js";
import { AppError } from "../types.js";

export class ShowtimesService{
    async findShowtimes(date?: string){
        if(date){
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        return await db.select().from(showtimes).where(
        and(
            gte(showtimes.startsAt, start),
            lte(showtimes.startsAt, end)
            )
        )

        }

        return await db.select().from(showtimes)
    }

    async findShowtime(id: string){
        const [showtime] = await db.select().from(showtimes).where(eq(showtimes.id, id))
        if(!showtime){ throw new AppError(404, "Showtime not found") }

        return showtime
    }

    async createShowtimes(data: createShowtimeBody){
        const checkShowtime = await db.select().from(showtimes)
        .where(
            and
                (eq(showtimes.hall, data.hall),
                or 
                (and(lt(showtimes.startsAt, data.endsAt), gt(showtimes.endsAt, data.startsAt))
              )
             )
            )
        if(checkShowtime.length > 0){
            throw new AppError(400, `${data.hall} is not available at that specific time.`)
        }

        const [createShowtime] = await db.insert(showtimes).values({ ...data }).returning()
        return createShowtime
    }

    async updateShowtime(id: string, data: updateShowtimeBody){
        const [update] = await db.update(showtimes).set({ ...data }).where(eq(showtimes.id, id)).returning()
        if(!update){ throw new AppError(404, "Showtime not found") }

        return update
    }

    async removeShowtime(id: string){
        const [remove] = await db.delete(showtimes).where(eq(showtimes.id, id)).returning()
        if(!remove){ throw new AppError(404, "Movie not found") }

        return remove
    }
}