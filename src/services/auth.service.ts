import { db } from '../db/db.js'
import { refreshTokens, users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { loginSchemaBody, registerSchemaBody } from '../validation/schemas.js'
import bcrypt from 'bcrypt'
import { AppError } from '../types.js'
import { accessToken, refreshToken } from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'


export class AuthService {
    async createUser(data: registerSchemaBody){
        const [userExists] = await db.select().from(users).where(eq(users.email, data.email))
        if(userExists){
            throw new AppError(400, "User already exists")
        }

        const passwordHash = await bcrypt.hash(data.password, 10)

        await db.insert(users).values({ ...data, password: passwordHash })
        return { message: "User created" }
    }

    async loginUser(data: loginSchemaBody){
        const [user] = await db.select().from(users).where(eq(users.email, data.email))
        if(!user){
            throw new AppError(401, "Wrong credentials")
        }

        const match = await bcrypt.compare(data.password, user.password)
        if(!match){
            throw new AppError(401, "Wrong credentials")
        }

        const generateAccessToken = accessToken(user.id, user.role, user.email)
        const generateRefreshToken = refreshToken(user.id, user.role, user.email)

        await db.update(users).set({ refreshToken: generateRefreshToken }).where(eq(users.id, user.id))

        return { generateAccessToken, generateRefreshToken, id: user.id, name: user.name, email: user.email, role: user.role }
    }

    async logoutUser(id: string){
        await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, id))
    }

    async refreshUser(token: string){
        if(!token){
            throw new AppError(401, "No refresh token")
        }

        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { id: string; role: string; email: string }

        const [user] = await db.select().from(users).where(eq(users.id, decoded.id))

        if(!user || user.refreshToken !== token){ throw new AppError(401, "Bad refresh token") }

        const generateRefreshToken = refreshToken(user.id, user.role, user.email)
        const generateAccessToken = accessToken(user.id, user.role, user.email)

        await db.update(users).set({ refreshToken: generateRefreshToken }).where(eq(users.id, decoded.id))

        return { generateAccessToken, generateRefreshToken }
    }
}