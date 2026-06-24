import type { Request, Response, NextFunction } from "express";
import { AdminService } from "../../services/admin.service.js";

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
        const response = await 

        res.status(200).json()
    }catch(err){
        next(err)
    }
}

export const getShowtimeReport = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await 

        res.status(200).json()
    }catch(err){
        next(err)
    }
}