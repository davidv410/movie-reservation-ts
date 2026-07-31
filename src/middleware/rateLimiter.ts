import type { Request, Response, NextFunction } from "express"
import { ratelimit } from "../lib/rateLimit.js"

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip
    const { success } = await ratelimit.limit(identifier!)

    if (!success) {
        return res.status(429).json({ message: "Too many requests, please slow down." })
    }

    next()
}