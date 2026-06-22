import { and, eq, lt, gt, or } from "drizzle-orm";
import { db } from "../db/db.js";
import { showtimes } from "../db/schema.js";
import type { createShowtimeBody, updateShowtimeBody } from "../validation/schemas.js";
import { AppError } from "../types.js";

export class ShowtimesService{
    async findShowtimes(){
        return await db.select().from(showtimes)
    }

    async findShowtime(id: string){
        const [showtime] = await db.select().from(showtimes).where(eq(showtimes.id, id))
        if(!showtime){
            throw new AppError(404, "Showtime not found")
        }

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