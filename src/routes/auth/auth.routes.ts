import { Router } from "express"
import { signup, login, logout, refresh } from "./auth.controller.js";
import {protect} from "../../middleware/protect.js";

export const authRouter = Router()

authRouter.post("/login", login)
authRouter.post("/register", signup)
authRouter.post("/refresh", refresh)
authRouter.post("/logout", protect, logout)