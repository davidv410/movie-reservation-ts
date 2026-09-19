import cron from "node-cron";
import { db } from "../db/db.js";
import { reservations, showtimes } from "../db/schema.js";
import { and, eq, lt } from "drizzle-orm";

cron.schedule("0 3 * * *", async () => {
  try {
        const update = await db.update(reservations)
        .set({ status: "completed" })
        .from(showtimes)
        .where(and(
            eq(reservations.showtimeId, showtimes.id),
            eq(reservations.status, "confirmed"),
            lt(showtimes.startsAt, new Date())
        )).returning({ id: reservations.id })
    
        if(update.length === 0) return
        console.log(update.length)
  } catch (err) {
    console.error("Cron failed", err);
  }
});