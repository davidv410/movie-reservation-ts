import type { createMovieBody, updateMovieBody } from "../validation/schemas.js";
import { db } from "../db/db.js";
import { movies, genres, movieGenres } from "../db/schema.js";
import { AppError } from "../types.js";
import { eq, inArray } from "drizzle-orm";

export class MovieService{
    async findMovies(){ return await db.select().from(movies) }

    async findMovie(id: string){
        const [movie] = await db.select().from(movies).where(eq(movies.id, id))
        if(!movie){ throw new AppError(404, "Movie not found") }
        return movie
    }

    async createMovie(data: createMovieBody){
        const { genreIds, ...movieData } = data

        const [movie] = await db.insert(movies).values({ ...movieData }).returning()
        if(!movie){ throw new AppError(400, "Failed to create movie") }

        const findGenre = await db.select().from(genres).where(inArray(genres.id, genreIds))
        if (findGenre.length !== genreIds.length) { throw new AppError(404, "One or more genres not found"); }

        const [genre] = await db.insert(movieGenres).values( genreIds.map((genreId) => ({ movieId: movie.id, genreId })) ).returning()

        return { movie, genre}
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