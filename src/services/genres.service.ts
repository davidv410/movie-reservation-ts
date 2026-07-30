import {db} from "../db/db.js";
import {genres} from "../db/schema.js";
import { redis } from "../lib/redis.js";

export class GenresService {
    async fetchGenres(){
        const key = 'genres'

        const cached = await redis.get(key)
        if(cached) {
            console.log('cache hit')
            return cached
        }

        const result = await db.select().from(genres)
        await redis.set(key, JSON.stringify(result), { ex: 60 * 60 })
    }
}