import type { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
   if(req.user!.role !== 'admin'){
        return res.status(400).json({ message: 'Access denied' })
   }
    next()
}