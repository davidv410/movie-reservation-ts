# Movie Reservation - API

TypeScript/Express backend for a movie reservation system. Movies, showtimes, seat maps, reservations. Frontend repo: [movie-reservation-frontend](https://github.com/davidv410/movie-reservation-frontend).

## About this project

The main thing I wanted to get right was preventing double bookings. It's easy to write a version that "mostly works" but breaks if two people click the same seat at the same time, so I tried to actually handle that properly instead of just checking availability.

Two core pieces:

1. `createReservation` runs inside a DB transaction and locks the seat row (`SELECT ... FOR UPDATE`) before checking if it's available. So if two requests come in for the same seat at basically the same time, Postgres just handles them one after another instead of both thinking the seat is free.
2. There's also a partial unique index on `reservations (seat_id, showtime_id) WHERE status = 'confirmed'` as a backup. Even if I messed up the transaction logic somewhere, the DB itself won't allow two confirmed reservations for the same seat/showtime.

```ts
// src/services/reservations.service.ts
const transaction = await db.transaction(async (tx) => {
  const lockedSeats = [];
  for (const seatId of data.seatIds) {
    const [seat] = await tx.select().from(seats).where(eq(seats.id, seatId)).for("update");
    if (!seat) throw new AppError(404, "Seat not found");
    if (!seat.isAvailable) throw new AppError(400, "Seat is not available");
    lockedSeats.push(seat);
  }

  await tx.update(seats).set({ isAvailable: false }).where(inArray(seats.id, lockedSeats.map(s => s.id)));
  const reservations = await tx.insert(reservations).values(
    lockedSeats.map(seat => ({ userId, seatId: seat.id, pricePaid: seat.price, paymentId: payment.id, status: "pending_payment" }))
  ).returning();

  return { reservations, ... };
});
```

## Payments (Stripe)

1. Seats get locked, reservations and payment are inserted as pending
2. The frontend collects card details via Stripe's Payment Element and confirms the payment.
3. A Stripe webhook (`payment_intent.succeeded` / `payment_intent.payment_failed` / `payment_intent.canceled` / `charge.refunded`) confirms or cancels a booking, never the initial request or the frontend's response.is the source of truth.
4. A declined card attempt does not release the seat. Only an explicit cancellation or a successful payment resolves a `pending_payment` reservation.
5. Cancelling a paid (`confirmed`) reservation triggers a Stripe refund. Since one payment can cover multiple seats booked together, cancelling any one seat refunds and cancels the entire booking.

Currently running in Stripe test mode

## Background jobs (BullMQ)
 
Two queues, backed by the same Upstash Redis instance used for rate limiting (via its TCP endpoint — BullMQ needs a real persistent connection, not the REST client):
 
- **`email`** — confirmation and cancellation emails, sent via Resend.
- **`cleanup`** — a delayed job scheduled at booking time that checks, 15 minutes later, whether a reservation is still `pending_payment`. If the user never completed checkout, it cancels the PaymentIntent on Stripe's side, which triggers `payment_intent.canceled` and releases the seat.


## Features

- Register/login with JWT (access + refresh tokens), passwords hashed with bcrypt
- Admin vs user roles, checked with middleware on protected routes
- Movies + genres CRUD, poster images uploaded to Cloudflare R2
- Showtimes CRUD (movie, hall, time)
- Seat maps per showtime: row, number, type, price
- Book multiple seats atomically, pay via Stripe, view bookings, cancel with automatic refund
- Confirmation/cancellation emails via Resend, sent through a BullMQ queue
- Abandoned-checkout cleanup so unpaid seat holds don't lock seats forever
- Book / view / cancel reservations, cancelling frees the seat back up
- Rate limiting with Upstash Redis
- Zod for request validation

## Stack

Node, TypeScript, Express, PostgreSQL + Drizzle ORM, JWT auth, Upstash Redis, BullMQ, Stripe, Resend, Cloudflare R2, Zod, Vitest + Supertest for tests. GitHub Actions runs tests then builds/pushes a Docker image on push to main.

## Folder structure

```
src/
├── routes/
│   ├── auth/
│   ├── movies/
│   ├── genres/
│   ├── showtimes/
│   ├── seats/
│   ├── reservations/
│   ├── webhooks/
│   └── admin/
├── services/
│   └── queues/
├── middleware/
├── db/
├── storage/
├── lib/
├── validation/
└── tests/

```

## Running it locally

You'll need Node, a Postgres db, an Upstash Redis instance, and a Cloudflare R2 bucket for uploads.

```bash
git clone https://github.com/davidv410/movie-reservation-ts.git
cd movie-reservation-ts
npm install
```

Make a `.env` file with:

```env
PORT=5000
NODE_ENV=development
 
DATABASE_URL=postgres://user:password@localhost:5432/movie_reservation
TEST_DATABASE_URL=postgres://user:password@localhost:5432/movie_reservation_test
 
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
 
REDIS_URL=
REDIS_TOKEN=
REDIS_URL_TCP=
 
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
 
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
 
RESEND_API_KEY=

```

Then:

```bash
npm run db:migrate
npm run dev
```

Runs on `http://localhost:5000`.

For Stripe webhooks locally, run the Stripe CLI

Tests: `npm test` (uses `TEST_DATABASE_URL`). Same thing runs in CI before it builds the Docker image.

## Still to do

There's more I want to add:

- More tests — I've tested auth but not the double-booking scenario.
- API docs
- Better logging, right now it's mostly console.log
- A daily job to mark reservations `completed` once their showtime has passed, for cleaner reporting
- A cutoff window on cancellations