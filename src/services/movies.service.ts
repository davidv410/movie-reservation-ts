import type { createMovieBody, updateMovieBody } from "../validation/schemas.js";
import { db } from "../db/db.js";
import { movies } from "../db/schema.js";
import { AppError } from "../types.js";
import { eq } from "drizzle-orm";

export class MovieService{
    async findMovies(){
        return await db.select().from(movies)
    }

    async findMovie(id: string){
        const [movie] = await db.select().from(movies).where(eq(movies.id, id))
        if(!movie){
            throw new AppError(404, "Movie not found")
        }
        return movie
    }

    async createMovie(data: createMovieBody){
        const [movie] = await db.insert(movies).values({ ...data }).returning()
        if(!movie){ throw new AppError(400, "Failed to create movie") }
        return movie
    }

    async updateMovie(movieId: string, data: updateMovieBody){
        const [update] = await db.update(movies).set({ ...data }).where(eq(movies.id, movieId)).returning()
        if(!update){ throw new AppError(404, "Movie not found") }

        return update
    }

    async removeMovie(movieId: string){
        const [remove] = await db.delete(movies).where(eq(movies.id, movieId)).returning()
        if(!remove){ throw new AppError(404, "Movie not found") }

        return remove
    }
}