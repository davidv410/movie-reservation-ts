import type { Request, Response, NextFunction } from "express";
import { createMovieSchema, fileSchema, paramsSchema, updateMovieSchema } from "../../validation/schemas.js";
import { AppError } from "../../types.js";
import { MovieService } from "../../services/movies.service.js";

const movieService = new MovieService()

export const findMovies = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await movieService.findMovies(req.query)

        res.status(200).json({ movies: response.list , pages: response.pageArr })
    }catch(err){
        next(err)
    }
}

export const movieSelect = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await movieService.findMovieSelect()

        res.status(200).json({ movies: response })
    }catch(err){
        next(err)
    }
}

export const findMovie = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsed = paramsSchema.safeParse(req.params);
        if(!parsed.success){ throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid request params') }

        const response = await movieService.findMovie(parsed.data.id)

        res.status(200).json(response)
    }catch(err){
        next(err)
    }
}

export const createMovie = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsed = createMovieSchema.safeParse(req.body)
        if(!parsed.success){ throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid request body') }

        const response = await movieService.createMovie(parsed.data)

        res.status(201).json({ message: "Movie created", response })
    }catch(err){
        next(err)
    }
}

export const updateMovie = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsedParams = paramsSchema.safeParse(req.params);
        if(!parsedParams.success){ throw new AppError(400, parsedParams.error.issues[0]?.message ?? 'Invalid request params') }
        
        const parsedBody = updateMovieSchema.safeParse(req.body)
        if(!parsedBody.success){ throw new AppError(400, parsedBody.error.issues[0]?.message ?? 'Invalid request body') }

        let parsedFile
        if(req.file){
            parsedFile = fileSchema.safeParse(req.file)
            if(!parsedFile.success){ throw new AppError(400, parsedFile.error.issues[0]?.message ?? 'Invalid request file') }
        }

        const response = await movieService.updateMovie(parsedParams.data.id, parsedBody.data, parsedFile?.data)

        res.status(200).json({ update: response })
    }catch(err){
        next(err)
    }
}

export const removeMovie = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsed = paramsSchema.safeParse(req.params)
        if(!parsed.success){ throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid request params') }
        
        const response = await movieService.removeMovie(parsed.data.id)

        res.status(200).json({ removed: response })
    }catch(err){
        next(err)
    }
}