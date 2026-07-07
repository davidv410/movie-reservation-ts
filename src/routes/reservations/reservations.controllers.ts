import type { Request, Response, NextFunction } from "express";
import { ReservationsService } from "../../services/reservations.service.js";
import { createReservationSchema, paramsSchema } from "../../validation/schemas.js";
import { AppError } from "../../types.js";

const reservationsService = new ReservationsService()

export const getReservations = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await reservationsService.getReservations(req.user!.id, req.user!.role)

        res.status(200).json({ reservations: response })
    }catch(err){
        next(err)
    }
}

export const getReservation = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsedParams = paramsSchema.safeParse(req.params)
        if(!parsedParams.success){ throw new AppError(400, parsedParams.error.issues[0]?.message ?? 'Invalid requst params') }

        const response = await reservationsService.getReservation(req.user!.id, parsedParams.data.id)

        res.status(200).json({ reservation: response })
    }catch(err){
        next(err)
    }
}

export const createReservation = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsed = createReservationSchema.safeParse(req.body)
        if(!parsed.success){ throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid body') }

        const response = await reservationsService.createReservation(req.user!.id, parsed.data)

        res.status(201).json({ response })
    }catch(err){
        next(err)
    }
}


export const removeReservation = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsedParams = paramsSchema.safeParse(req.params)
        if(!parsedParams.success){ throw new AppError(400, parsedParams.error.issues[0]?.message ?? 'Invalid requst params') }

        const response = await reservationsService.removeReservation(req.user!.id, parsedParams.data.id)

        res.status(200).json({ cancelled: response })
    }catch(err){
        next(err)
    }
}