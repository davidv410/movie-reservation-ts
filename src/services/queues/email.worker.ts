import { Worker } from "bullmq";
import { workerConnection } from "../../lib/ioredis.js";
import { sendEmailSeatConfirmation, sendEmailSeatCancellation, type emailDataConfirm, type emailDataCancel } from "../emailNotifications.service.js";

export const emailWorker = new Worker("email",
    async(job) => {
        switch(job.name){
            case "confirmation":
                return sendEmailSeatConfirmation(job.data as emailDataConfirm);
            case "cancellation":
                return sendEmailSeatCancellation(job.data as emailDataCancel);
            default:
                throw new Error(`Unknown job name: ${job.name}`)
        }
    },
    {connection:workerConnection}
)

emailWorker.on("completed", (job) => {
    console.log(`Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err)
})