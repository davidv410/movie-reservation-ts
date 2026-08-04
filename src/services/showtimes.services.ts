import { and, eq, lt, gt, or, gte, lte } from "drizzle-orm";
import { db } from "../db/db.js";
import {reservations, seats, showtimes, movies} from "../db/schema.js";
import type { createShowtimeBody, updateShowtimeBody } from "../validation/schemas.js";
import { AppError } from "../types.js";
import { redis } from "../lib/redis.js";

export class ShowtimesService{
    async findShowtimes(date?: string, movieId?: string){
        const key = "showtimes"

        if(!date && !movieId){
            const cached = await redis.get(key)
            if(cached) { return cached }
        }

        const conditions = []

        if(date){
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        conditions.push(gte(showtimes.startsAt, start))
        conditions.push(lte(showtimes.startsAt, end))
        }

        if(movieId){
            conditions.push(eq(showtimes.movieId, movieId))
        }

        if (conditions.length) return await db.select().from(showtimes).leftJoin(movies, eq(showtimes.movieId, movies.id)).where(and(...conditions))

        const result = await db.select().from(showtimes).leftJoin(movies, eq(showtimes.movieId, movies.id))

        await redis.set(key, JSON.stringify(result),  { ex: 60 * 60 })

        return result
    }

    async findShowtime(id: string){
        const key = `showtime:${id}`

        const cached = await redis.get(key)
        if(cached) { return cached }

        const [showtime] = await db.select().from(showtimes).where(eq(showtimes.id, id))

        await redis.set(key, JSON.stringify(showtime), { ex: 60 * 60 })

        if(!showtime){ throw new AppError(404, "Showtime not found") }

        return showtime
    }

    async createShowtimes(data: createShowtimeBody){
        const transaction = await db.transaction(async (tx) => {
            const checkShowtime = await tx.select().from(showtimes)
            .where(
                and
                    (eq(showtimes.hall, data.hall),
                    or 
                    (and(lt(showtimes.startsAt, data.endsAt), gt(showtimes.endsAt, data.startsAt))
                  )
                 )
                ).for("update")
                
            if(checkShowtime.length > 0){
                throw new AppError(400, `${data.hall} is not available at that specific time.`)
            }
    
            const [showtime] = await tx.insert(showtimes).values({ ...data }).returning()
    
            const rows: string[] = ["A", "B", "C", "D", "E"]
    
            const seatsPerRow: number = 20
            const totalSeatsShowtime: number = showtime!.totalSeats
    
            let count: number = 0;
    
            const rowCount: number = Math.ceil(totalSeatsShowtime / seatsPerRow)
            if (rowCount > rows.length) { throw new AppError(500, "Not enough rows") }
    
            const finalSeats = []
    
            for(let i = 0; i < rowCount; i++){
              const row = rows[i]!
              for(let seatNum = 1; seatNum <= seatsPerRow; seatNum++){
                if(count >= totalSeatsShowtime) break;
    
                finalSeats.push({            
                showtimeId: showtime!.id,
                row,
                number: seatNum,
                price: "10.00", })
    
                count++;
              }
            }
    
            await tx.insert(seats).values(finalSeats)

            return { showtime }
        })
        await redis.del('showtimes')
        
        return { showtime: transaction.showtime, seats: "created" }

    }

    async updateShowtime(id: string, data: updateShowtimeBody){
        const [update] = await db.update(showtimes).set({ ...data }).where(eq(showtimes.id, id)).returning()
        if(!update){ throw new AppError(404, "Showtime not found") }

        await redis.del(`showtime:${id}`)
        await redis.del('showtimes')

        return update
    }

    async removeShowtime(id: string){
        const [remove] = await db.delete(showtimes).where(eq(showtimes.id, id)).returning()
        if(!remove){ throw new AppError(404, "Movie not found") }

        await redis.del(`showtime:${id}`)
        await redis.del('showtimes')

        return remove
    }
}