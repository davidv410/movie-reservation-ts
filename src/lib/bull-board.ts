import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { emailQueue } from "../services/queues/email.queue.js";
import { cleanupQueue } from "../services/queues/cleanup.queue.js";
import { completeReservationQueue } from "../services/queues/complete-reservations.queue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
    queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(cleanupQueue), new BullMQAdapter(completeReservationQueue)],
    serverAdapter,
});

export { serverAdapter };