import { Router } from "express"
import { signup, login, logout, refresh, me } from "./auth.controller.js";
import {protect} from "../../middleware/protect.js";
import { rateLimiter } from "../../middleware/rateLimiter.js";
import { strictLimiter } from "../../lib/rateLimit.js";

export const authRouter = Router()

authRouter.post("/login", rateLimiter(strictLimiter), login)
authRouter.post("/register", rateLimiter(strictLimiter), signup)
authRouter.post("/refresh", refresh)
authRouter.post("/logout", protect, logout)
authRouter.get("/me", protect, me)