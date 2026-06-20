import { db } from './db.js';
import { sql } from 'drizzle-orm';

const result = await db.execute(sql`SELECT 1`);
console.log('Database connected', result);