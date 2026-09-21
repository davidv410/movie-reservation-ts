import {db} from "../db/db.js";
import {genres} from "../db/schema.js";
import { getCache, setCache } from "../lib/redis.js";

export class GenresService {
    async fetchGenres(){
        const key = 'genres'

        const cached = await getCache(key)

        if(cached) return cached

        const result = await db.select().from(genres)

        await setCache(key, JSON.stringify(result))

        return result
    }
}