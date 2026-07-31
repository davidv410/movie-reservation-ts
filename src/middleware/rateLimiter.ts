import type { Request, Response, NextFunction } from "express"
import { Ratelimit } from "@upstash/ratelimit"

export const rateLimiter = (limiter: Ratelimit) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const identifier = req.ip
        const { success } = await limiter.limit(identifier!)

        if (!success) {
            return res.status(429).json({ message: "Too many requests, please slow down." })
        }

        next()
    }
}