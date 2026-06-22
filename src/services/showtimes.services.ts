import { and, eq, lt, gt, or } from "drizzle-orm";
import { db } from "../db/db.js";
import { showtimes } from "../db/schema.js";
import type { createShowtimeBody } from "../validation/schemas.js";
import { AppError } from "../types.js";

export class ShowtimesService{
    async findShowtimes(){
        return await db.select().from(showtimes)
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
}