import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const connectionString = process.env.NODE_ENV === "test" ? 
    process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL

const pool = new Pool({
    connectionString,
    max: 20,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

export const db = drizzle(pool)