import type { Request, Response, NextFunction } from "express"
import { Ratelimit } from "@upstash/ratelimit"
import { AppError } from "../types.js"

export const rateLimiter = (limiter: Ratelimit) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (process.env.DISABLE_RATE_LIMIT === "true") return next();

        let success = true;
        try {
            ({ success } = await limiter.limit(req.ip!));
        } catch (err) {
            console.error("Rate limiter unavailable, failing open:", err);
            return next();
        }

        if (!success) {
            return next(new AppError(429, "Too many requests, please slow down."));
        }
        next();
    }
}