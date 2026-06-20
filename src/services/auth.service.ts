import { db } from '../db/db.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { loginSchemaBody, registerSchemaBody } from '../validation/schemas.js'
import bcrypt from 'bcrypt'
import { AppError } from '../types.js'
import { accessToken, refreshToken } from '../utils/generateToken.js'


export class AuthService {
    async createUser(data: registerSchemaBody){
        const userExist = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
        if(userExist.length > 0){ throw new AppError(400, "User exists") }

        const hash = await bcrypt.hash(data.password, 10)

        return db.insert(users).values({ name: data.name, email: data.email, password: hash }).returning()
    }

    async loginUser(data: loginSchemaBody){
        const [user] = await db.select().from(users).where(eq(users.email, data.email))
        if(!user){
            throw new AppError(404, "Wrong credentials")
        }

        const match = await bcrypt.compare(data.password, user.password)
        if(!match){
            throw new AppError(404, "Wrong credentials")
        }

        const generateAccessToken = accessToken(user.id, user.role, user.email)
        const generateRefreshToken = refreshToken(user.id, user.role, user.email)

        await db.update(users).set({ refreshToken: generateRefreshToken }).where(eq(users.id, user.id))

        return { status: 200, message: "User logged in", generateAccessToken, generateRefreshToken }
    }

    async logoutUser(id: number){
        await db.update(users).set({ refreshToken: null }).where(eq(users.id, id))
    }
}