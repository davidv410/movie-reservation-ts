import type { Request, Response, NextFunction } from "express";

export const getReservations = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await 

        res.status(200).json()
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