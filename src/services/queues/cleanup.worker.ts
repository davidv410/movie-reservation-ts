import { Worker } from "bullmq";
import { workerConnection } from "../../lib/ioredis.js";
import { db } from "../../db/db.js";
import { payments } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { stripe } from "../../lib/stripe.js";

const expirePendingPayment = async ({ paymentId }: {paymentId: string}) => {
    const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId));

    if (!payment || payment.status !== "pending") return;
    if (!payment.stripePaymentId) {
        console.error(`Payment ${paymentId} has no stripePaymentId, cannot cancel`);
        return;
    }

    await stripe.paymentIntents.cancel(payment.stripePaymentId);
}

export const cleanupWorker = new Worker("cleanup",
    async(job) => {
        switch(job.name){
            case "expire-pending-payment":
                return expirePendingPayment(job.data as { paymentId: string });
            default:
                throw new Error(`Unknown job name: ${job.name}`)
        }
    },
    {connection:workerConnection}
)

cleanupWorker.on("completed", (job) => {
    console.log(`Cleanup job ${job.id} completed`);
});

cleanupWorker.on("failed", (job, err) => {
    console.error(`Cleanup job ${job?.id} failed:`, err)
})