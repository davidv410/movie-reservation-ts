import type { Request, Response, NextFunction } from "express";
import { AppError } from "../types.js";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof AppError){
        return res.status(err.statusCode).json({ message: err.message })
    }
    
    if(err instanceof Error){
        return res.status(500).json({ message: 'Server error' })
    }
}