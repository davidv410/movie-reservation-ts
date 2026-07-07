import type { createMovieBody, updateMovieBody } from "../validation/schemas.js";
import { db } from "../db/db.js";
import { movies, genres, movieGenres } from "../db/schema.js";
import { AppError } from "../types.js";
import { eq, inArray } from "drizzle-orm";

export class MovieService{
    async findMovies(){ return await db.select().from(movies) }

    async findMovie(id: string){
        const movie = await db.select().from(movies).where(eq(movies.id, id)).leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))

        if(!movie){ throw new AppError(404, "Movie not found") }

        return {
            ...movie[0]!.movies,
            genreIds: movie
                .filter(m => m.movie_genres)
                .map(m => m.movie_genres!.genreId)
        }
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
        const { genreIds, ...movieData } = data

        return await db.transaction(async (tx) => {
            if(genreIds){
                await tx.delete(movieGenres).where(eq(movieGenres.movieId, movieId))

                if(genreIds.length > 0){
                    const genreInsert = genreIds.map(genre => ({
                        movieId: movieId,
                        genreId: genre,
                    }))

                    await tx.insert(movieGenres).values(genreInsert);
                }
            }
            const [updateMovie] =  await tx.update(movies).set(movieData).where(eq(movies.id, movieId)).returning()
            if(!updateMovie){ throw new AppError(404, "Movie not found") }

            return updateMovie
        })
    }

    async removeMovie(movieId: string){
        const [remove] = await db.delete(movies).where(eq(movies.id, movieId)).returning()
        if(!remove){ throw new AppError(404, "Movie not found") }

        return remove
    }
}