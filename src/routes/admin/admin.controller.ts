import type { Request, Response, NextFunction } from "express";
import { AdminService } from "../../services/admin.service.js";
import { paramsSchema } from "../../validation/schemas.js";
import { AppError } from "../../types.js";

const adminService = new AdminService()

export const getReservations = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await adminService.getReservations()

        res.status(200).json({allReservations: response})
    }catch(err){
        next(err)
    }
}

export const getShowtimeReservations = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsedParams = paramsSchema.safeParse(req.params)
        if(!parsedParams.success){ throw new AppError(400, parsedParams.error.issues[0]?.message ?? 'Invalid requst params') }
        const response = await adminService.getShowtimeReservations(parsedParams.data.id)

        res.status(200).json(response)
    }catch(err){
        next(err)
    }
}

export const getShowtimeReport = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsedParams = paramsSchema.safeParse(req.params)
        if(!parsedParams.success){ throw new AppError(400, parsedParams.error.issues[0]?.message ?? 'Invalid requst params') }
        const response = await adminService.getShowtimeReport(parsedParams.data.id)

        res.status(200).json(response)
    }catch(err){
        next(err)
    }
}