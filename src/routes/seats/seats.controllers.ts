import type {Request, Response, NextFunction} from "express";
import {SeatsService} from "../../services/seats.service.js";
import {paramsSchema} from "../../validation/schemas.js";
import {AppError} from "../../types.js";

const seatsService = new SeatsService();

export const findSeats = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const parsed = paramsSchema.safeParse(req.params)
        if(!parsed.success) { throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid request params') }

        const response = await seatsService.findSeats(parsed.data.id)

        res.status(200).json({ showtimeSeats: response })
    }catch(err){
        next(err)
    }
}