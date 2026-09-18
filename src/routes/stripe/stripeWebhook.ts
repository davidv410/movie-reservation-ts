import type { Request, Response } from "express";
import { stripe } from "../../lib/stripe.js";
import { db } from "../../db/db.js";
import { payments, reservations, seats } from "../../db/schema.js";
import { eq, inArray } from "drizzle-orm";
import { emailQueue } from "../../services/queues/email.queue.js";
import { users, movies, showtimes } from "../../db/schema.js";

export const stripeWebhook = async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"]

    let event
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature!,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error("Webhook signature verification failed:", err)
        return res.status(400).send(`Webhook Error: ${(err as Error).message}`)
    }

    if(event.type === "payment_intent.succeeded"){

        const paymentIntent = event.data.object
        await paymentSucceeded(paymentIntent.id)

    }else if(event.type === "payment_intent.payment_failed"){

        const paymentIntent = event.data.object
        await paymentFailed(paymentIntent.id)

    }else if(event.type === "payment_intent.canceled"){

        const paymentIntent = event.data.object
        await paymentCancelled(paymentIntent.id)

    }else if(event.type === "charge.refunded"){
        const charge = event.data.object
        await chargeRefunded(charge.payment_intent as string)
    }else{
        console.log(`Other event type: ${event.type}`)
    }


    res.json({ received: true })
};

const paymentSucceeded = async (stripePaymentIntentId: string) => {
    const [payment] = await db.select().from(payments)
        .where(eq(payments.stripePaymentId, stripePaymentIntentId));

    if (!payment) {
        console.error(`No payment found for PaymentIntent ${stripePaymentIntentId}`)
        return;
    }

    if (payment.status === "succeeded") {
        return; 
    }

    await db.transaction(async (tx) => {
        await tx.update(payments).set({ status: "succeeded" }).where(eq(payments.id, payment.id))
        await tx.update(reservations).set({ status: "confirmed" }).where(eq(reservations.paymentId, payment.id))
    })

    const bookingInfo = await db.select({
        userEmail: users.email,
        movieTitle: movies.title,
        startsAt: showtimes.startsAt,
        seatRow: seats.row,
        seatNumber: seats.number,
    })
    .from(reservations)
    .innerJoin(seats, eq(reservations.seatId, seats.id))
    .innerJoin(showtimes, eq(reservations.showtimeId, showtimes.id))
    .innerJoin(movies, eq(showtimes.movieId, movies.id))
    .innerJoin(users, eq(reservations.userId, users.id))
    .where(eq(reservations.paymentId, payment.id))

    if (bookingInfo.length === 0) {
        console.error(`No reservations found for payment ${payment.id}`)
        return
    }

    const { userEmail, movieTitle, startsAt } = bookingInfo[0]!
    const seatLabels = bookingInfo.map(b => `${b.seatRow}${b.seatNumber}`)

    emailQueue.add("confirmation", {
        userEmail,
        movieTitle,
        startsAt,
        seats: seatLabels,
    }).catch(err => console.error("Failed to queue confirmation email:", err))
}

const paymentFailed = async (stripePaymentIntentId: string) => {
    const [payment] = await db.select().from(payments)
        .where(eq(payments.stripePaymentId, stripePaymentIntentId))

    if (!payment) return

    //didnt update/set anything because if it fails the first time it updates
    //everything but the user can still retry with a different credit card
    //and it can create race conditions on seats that became available/arent locked anymroe
    //will just leave it on pending until BullMQ does a cleanup afterwards (after about 15 mins)
}

const paymentCancelled = async (stripePaymentIntentId: string) => {
    const [payment] = await db.select().from(payments)
        .where(eq(payments.stripePaymentId, stripePaymentIntentId))

    if (!payment) return

    await db.transaction(async (tx) => {
        await tx.update(payments).set({ status: "failed" }).where(eq(payments.id, payment.id))
    
        const pendingReservations = await tx.select().from(reservations).where(eq(reservations.paymentId, payment.id))
    
        await tx.update(reservations).set({ status: "expired" }).where(eq(reservations.paymentId, payment.id))
        await tx.update(seats).set({ isAvailable: true }).where(inArray(seats.id, pendingReservations.map(r => r.seatId)))
    })
}

const chargeRefunded = async (stripePaymentIntentId: string) => {
    const [payment] = await db.select().from(payments).where(eq(payments.stripePaymentId, stripePaymentIntentId))
    if(!payment) return

    const transaction = await db.transaction(async(tx) => {
        await tx.update(payments).set({ status: "refunded" }).where(eq(payments.id, payment.id))
    
        const userReservations = await tx.select({ seatId: reservations.seatId, pricePaid: reservations.pricePaid, userEmail: users.email })
        .from(reservations)
        .innerJoin(users, eq(reservations.userId, users.id))
        .where(eq(reservations.paymentId, payment.id))
    
        const totalAmount = userReservations.reduce((sum, r) => sum + Number(r.pricePaid), 0)
        
        await tx.update(reservations).set({ status: "cancelled" }).where(eq(reservations.paymentId, payment.id))
    
        await tx.update(seats).set({ isAvailable: true }).where(inArray(seats.id, userReservations.map(s => s.seatId)))

        return { userReservations, totalAmount }
    })

    const { userEmail } = transaction.userReservations[0]!
    
    emailQueue.add("cancelation", {
        userEmail,
        totalAmount: transaction.totalAmount
    }).catch(err => console.error("Failed to queue confirmation email:", err))    
}