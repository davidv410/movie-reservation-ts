import type { Request, Response, NextFunction } from "express";
import { ShowtimesService } from "../../services/showtimes.services.js";
import { createShowtimeSchema, paramsSchema, querySchema, updateShowtimeSchema } from '../../validation/schemas.js'
import { AppError } from "../../types.js";

const showtimesService = new ShowtimesService()

export const findShowtimes = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parseQuery = querySchema.safeParse(req.query)
        if(!parseQuery.success){ throw new AppError(400, parseQuery.error.issues[0]?.message ?? 'Invalid query') }
        const response = parseQuery ? await showtimesService.findShowtimes(parseQuery.data.date, parseQuery.data.movieId) : await showtimesService.findShowtimes()

        res.status(200).json({ showtimes: response })
    }catch(err){
        next(err)
    }
}

export const findShowtime = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsedParams = paramsSchema.safeParse(req.params)
        if(!parsedParams.success){ throw new AppError(400, parsedParams.error.issues[0]?.message ?? 'Invalid requst params') }
        const response = await showtimesService.findShowtime(parsedParams.data.id)

        res.status(200).json({ showtime: response })
    }catch(err){
        next(err)
    }
}

export const createShowtime = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsed = createShowtimeSchema.safeParse(req.body)
        if(!parsed.success){ throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid requst body') }

        const response = await showtimesService.createShowtimes(parsed.data)

        res.status(200).json({ created: response })
    }catch(err){
        console.log(err)
        next(err)
    }
}

export const updateShowtime = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsedParams = paramsSchema.safeParse(req.params);
        if(!parsedParams.success){ throw new AppError(400, parsedParams.error.issues[0]?.message ?? 'Invalid requst params') }

        const parsed = updateShowtimeSchema.safeParse(req.body)
        if(!parsed.success){
            throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid requst body')
        }

        const response = await showtimesService.updateShowtime(parsedParams.data.id, parsed.data)

        res.status(200).json({ updated: response })
    }catch(err){
        next(err)
    }
}

export const removeShowtime = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsedParams = paramsSchema.safeParse(req.params)
        if(!parsedParams.success){ throw new AppError(400, parsedParams.error.issues[0]?.message ?? 'Invalid requst params') }
        const response = await showtimesService.removeShowtime(parsedParams.data.id)

        res.status(200).json({ removed: response })
    }catch(err){
        next(err)
    }
}