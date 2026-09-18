import { Worker } from "bullmq";
import { workerConnection } from "../../lib/ioredis.js";
import { db } from "../../db/db.js";
import { reservations, showtimes } from "../../db/schema.js";
import { and, eq, lt } from "drizzle-orm";

const completeReservations = async () => {
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
}

export const showtimeCompletionWorker = new Worker(
    "complete-reservations",
    async (job) => {
        if (job.name === "update-complete") {
            return completeReservations();
        }
    },
    { connection: workerConnection }
);