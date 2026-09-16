import { Queue } from "bullmq"
import { queueConnection } from "../../lib/ioredis.js"
import type { EmailJob } from "../emailNotifications.service.js"

export const emailQueue = new Queue<EmailJob>("email", {
    connection: queueConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 }
    }
})