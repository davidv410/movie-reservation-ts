import { Queue } from "bullmq"
import { queueConnection } from "../../lib/ioredis.js"

export const cleanupQueue = new Queue("cleanup", {
    connection: queueConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 }
    }
})