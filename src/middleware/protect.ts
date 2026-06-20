import 'dotenv/config'
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from '../types.js';

export const protect = (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies.token
    console.log(req.cookies)

    try{
        if(!token){ throw new AppError(400, 'Access denied'); }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { id: number; role: string; email: string }
        req.user = decoded

        next()
    }catch(err){
        next(err)
    }
}