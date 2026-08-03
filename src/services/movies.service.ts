import type { createMovieBody, updateMovieBody } from "../validation/schemas.js";
import { db } from "../db/db.js";
import { movies, genres, movieGenres } from "../db/schema.js";
import { AppError } from "../types.js";
import {asc, eq, ilike, inArray, and, sql} from "drizzle-orm";
import { redis } from "../lib/redis.js";

type MoviesResult = {
    list: any[]
    pageArr: number[]
}


export class MovieService{
    async findMovies(query: any): Promise<MoviesResult>{
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 5;
        const offset = (page - 1) * limit;
        const search = query.search
        let genres = query.genre

        
        if (!genres) {
            genres = [];
        } else if (!Array.isArray(genres)) {
            genres = [genres]
        }
        
        const sortedGenres = genres.sort().join(',')
        const key = `movies:page=${page}:limit=${limit}:search=${search ?? ''}:genres=${sortedGenres}`

        const cached = await redis.get<MoviesResult>(key)

        if(cached) return cached

        let list
        let count

        if(genres.length > 0){
            list = await db.select({ title: movies.title, description: movies.description })
                .from(movies)
                .where(search && ilike(movies.title, `%${search}%`))
                .innerJoin(movieGenres, and(eq(movies.id, movieGenres.movieId), inArray(movieGenres.genreId, genres)))
                .orderBy(asc(movies.title))
                .limit(limit)
                .offset(offset)

            const [countResult] = await db.select({ count: sql<number>`count(distinct ${movies.id})::int` })
                .from(movies)
                .where(search && ilike(movies.title, `%${search}%`))
                .innerJoin(movieGenres, and(eq(movies.id, movieGenres.movieId), inArray(movieGenres.genreId, genres)))

            count = countResult!.count
        }else{
            list = await db.select()
                .from(movies)
                .where(search && ilike(movies.title, `%${search}%`))
                .orderBy(asc(movies.title))
                .limit(limit)
                .offset(offset)

            const [countResult] = await db.select({ count: sql<number>`count(*)::int` })
                .from(movies)
                .where(search && ilike(movies.title, `%${search}%`))

            count = countResult!.count
        }

        const pages = Math.ceil(count / limit)
        const pageArr: number[] = []
        for (let i = 1; i <= pages; i++){ pageArr.push(i) }

        const result = { list, pageArr }
        await redis.set(key, JSON.stringify(result), { ex: 60 * 60 })

        return result
    }

    async findMovieSelect(){
        return await db.select({ id: movies.id, title: movies.title }).from(movies)
    }

    async findMovie(id: string){
        const key = `movie:${id}`

        const cached = await redis.get(key)
        if(cached){ return cached }
        
        const movie = await db.select()
            .from(movies)
            .where(eq(movies.id, id))
            .leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))

        if(!movie){ throw new AppError(404, "Movie not found") }

        await redis.set(key, JSON.stringify(movie), { ex: 60 * 60 })

        return movie
    }

    async createMovie(data: createMovieBody){
        const { genreIds, ...movieData } = data

        const [movie] = await db.insert(movies).values({ ...movieData }).returning()
        if(!movie){ throw new AppError(400, "Failed to create movie") }

        const findGenre = await db.select().from(genres).where(inArray(genres.id, genreIds))
        if (findGenre.length !== genreIds.length) { throw new AppError(404, "One or more genres not found"); }

        const [genre] = await db.insert(movieGenres)
            .values( genreIds.map((genreId) => ({ movieId: movie.id, genreId })) )
            .returning()

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