import { Queue } from "bullmq"
import { queueConnection } from "../../lib/ioredis.js"

export const cleanupQueue = new Queue("cleanup", {
    connection: queueConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 10_000 },
        removeOnComplete: { age: 3600, count: 100 },
        removeOnFail: { age: 86400, count: 100 },
    }
})