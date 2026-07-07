import type { Request, Response, NextFunction } from "express"
import { AuthService } from '../../services/auth.service.js'
import { loginSchema, registerSchema } from "../../validation/schemas.js"
import { AppError } from "../../types.js";

const authService = new AuthService()

export const signup = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const parsed = registerSchema.safeParse(req.body)
        if(!parsed.success){
            throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid requst body')
        }
        await authService.createUser(parsed.data)
        res.status(201).json({ message: "User created" })
    }catch(err){
        next(err)
    }
}

export const login = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const parsed = loginSchema.safeParse(req.body)
        if(!parsed.success){
            throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid requst body')
        }

        const response = await authService.loginUser(parsed.data)

        res.cookie('token', response.generateAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 60 * 60 * 1000  //1h
        })

        res.cookie('refreshToken', response.generateRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000  //7d
        })

        res.status(200).json({
            message: "User logged in.",
            user: {
                id: response.id,
                name: response.name,
                email: response.email,
                role: response.role
            }
        })
    }catch(err){
        next(err)
    }
}

export const logout = async (req:Request, res:Response, next:NextFunction) =>{
    try{
        if (!req.user) {
            throw new AppError(401, 'Unauthorized');
        }

        await authService.logoutUser(req.user.id)

        res.clearCookie('token')
        res.clearCookie('refreshToken')

        res.status(200).json({ message: "User logged out" })
    }catch(err){
        next(err)
    }
}

export const refresh = async (req:Request, res:Response, next:NextFunction) =>{
    try{
        const response = await authService.refreshUser(req.cookies.refreshToken)

        res.cookie('token', response.generateAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 60 * 60 * 1000  //1h
        })

        return res.status(200).json({ message: "Token refreshed!" })
    }catch(err){
        next(err)
    }
}

export const me = async (req:Request, res:Response, next:NextFunction) => {
    res.json({ user: req.user })
}