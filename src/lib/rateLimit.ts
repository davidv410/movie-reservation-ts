import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "./redis.js"

export const strictLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:strict",
    limiter: Ratelimit.slidingWindow(5, "60 s"),
})

export const moderateLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:moderate",
    limiter: Ratelimit.slidingWindow(10, "60 s"),
})

export const lenientLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:lenient",
    limiter: Ratelimit.slidingWindow(30, "10 s"),
})