import 'dotenv/config'
import jwt from "jsonwebtoken";

export const generateAccessToken = (id: string, role: string, email: string) => { return jwt.sign({ id, role, email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' })}
export const generateRefreshToken = (id: string, role: string, email: string) => { return jwt.sign({ id, role, email }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' }) }
