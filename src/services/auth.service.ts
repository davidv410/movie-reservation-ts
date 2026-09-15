import { db } from '../db/db.js'
import { refreshTokens, users } from '../db/schema.js'
import { eq, and, isNull } from 'drizzle-orm'
import type { loginSchemaBody, registerSchemaBody } from '../validation/schemas.js'
import bcrypt from 'bcrypt'
import { AppError } from '../types.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'
import { generateHash } from '../utils/generateHash.js'


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
        if(!user){ throw new AppError(401, "Wrong credentials") }

        const match = await bcrypt.compare(data.password, user.password)
        if(!match){ throw new AppError(401, "Wrong credentials") }

        const accessToken = generateAccessToken(user.id, user.role, user.email)
        const refreshToken = generateRefreshToken(user.id, user.role, user.email)

        const tokenHash = generateHash(refreshToken)

        const decoded = jwt.decode(refreshToken) as { exp: number }
        const expiresAt = new Date(decoded.exp * 1000)

        await db.insert(refreshTokens).values({
            tokenHash,
            expiresAt,
            userId: user.id
        })

        return { 
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        }
    }

    async logoutUser(id: string){
        await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, id))
    }

    async refreshUser(token: string){
        if(!token){
            throw new AppError(401, "No refresh token")
        }

        let decoded: { id: string; role: string; email: string }
        try{
            decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { id: string; role: string; email: string }
        }catch(err){
            throw new AppError(401, "Refresh token not valid")
        }

        const tokenHash = generateHash(token)

        const [user] = await db.select().from(users).where(eq(users.id, decoded.id))

        const [hashMatch] = await db.select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))

        if(!hashMatch || hashMatch.expiresAt < new Date()){
            throw new AppError(401, "Refresh token not valid")
        }

        if(hashMatch.revokedAt){
            await db.update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(and(eq(refreshTokens.userId, decoded.id), isNull(refreshTokens.revokedAt)))

            throw new AppError(401, "Refresh token reuse, please log in again")
        }

        const accessToken = generateAccessToken(decoded.id, decoded.role, decoded.email)
        const refreshToken = generateRefreshToken(decoded.id, decoded.role, decoded.email)
        const newTokenHash = generateHash(refreshToken)
        
        const newRefreshDecoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { exp: number }
        const expiresAt = new Date(newRefreshDecoded.exp * 1000)
        
        await db.transaction(async (tx) => {
            const revoked = await tx.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, hashMatch.id)).returning()

            await tx.insert(refreshTokens).values({
                tokenHash: newTokenHash,
                expiresAt,
                userId: decoded.id
            })
        })

        return { accessToken, refreshToken }
    }
}