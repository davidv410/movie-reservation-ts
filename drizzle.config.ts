import 'dotenv/config'
import { defineConfig } from "drizzle-kit";

if(!process.env.DATABASE_URL){
    throw new Error("DB URL not set.")
}

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    }
});