import { Queue } from "bullmq";
import { queueConnection } from "../../lib/ioredis.js";

export const completeReservationQueue = new Queue("complete-reservations", {
    connection: queueConnection,
})

await completeReservationQueue.upsertJobScheduler(
    "complete-reservations",
    { pattern: "0 3 * * *" }, 
    {
        name: "update-complete", 
        data: {},
    }
)