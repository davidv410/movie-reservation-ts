import type { Request, Response, NextFunction } from "express";
import { ReservationsService } from "../../services/reservations.service.js";
import { createReservationSchema } from "../../validation/schemas.js";
import { AppError } from "../../types.js";

const reservationsService = new ReservationsService()

export const getReservations = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await reservationsService.getReservations()

        res.status(200).json({ reservations: response })
    }catch(err){
        next(err)
    }
}

export const getReservation = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await reservationsService.getReservation()

        res.status(200).json({ reservations: response })
    }catch(err){
        next(err)
    }
}

export const createReservation = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsed = createReservationSchema.safeParse(req.body)
        if(!parsed.success){ throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid body') }

        const response = await reservationsService.createReservation(req.user!.id, parsed.data)

        res.status(200).json({ response })
    }catch(err){
        next(err)
    }
}

export const updateReservation = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await reservationsService.updateReservation()

        res.status(200).json({ reservations: response })
    }catch(err){
        next(err)
    }
}

export const removeReservation = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await reservationsService.removeReservation()

        res.status(200).json({ reservations: response })
    }catch(err){
        next(err)
    }
}