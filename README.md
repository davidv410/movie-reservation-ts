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
  const [seat] = await tx.select().from(seats).where(eq(seats.id, data.seatId)).for("update");
  if (!seat) throw new AppError(404, "Seat not found");
  if (!seat.isAvailable) throw new AppError(400, "Seat is not available");

  await tx.update(seats).set({ isAvailable: false }).where(eq(seats.id, seat.id));
  const [reservation] = await tx.insert(reservations).values({ userId, ...data, pricePaid: seat.price }).returning();

  return { reservation };
});
```

## Features

- Register/login with JWT (access + refresh tokens), passwords hashed with bcrypt
- Admin vs user roles, checked with middleware on protected routes
- Movies + genres CRUD, poster images uploaded to Cloudflare R2
- Showtimes CRUD (movie, hall, time)
- Seat maps per showtime: row, number, type, price
- Book / view / cancel reservations, cancelling frees the seat back up
- Basic admin reports (all reservations, per-showtime, etc.)
- Rate limiting with Upstash Redis
- Zod for request validation

## Stack

Node, TypeScript, Express, PostgreSQL + Drizzle ORM, JWT auth, Upstash Redis, Cloudflare R2, Zod, Vitest + Supertest for tests. GitHub Actions runs tests then builds/pushes a Docker image on push to main.

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
│   └── admin/
├── services/       
├── middleware/    
├── db/             
├── storage/        
├── validation/     
└── tests/
```

## Data model

showtime belongs to a movie. seats belong to a showtime, unique per (showtimeId, row, number). reservation links user + showtime + seat, and that partial unique index mentioned above is what actually stops double bookings. Cancelling doesn't delete the row, it just flips status to cancelled and sets the seat back to available.

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

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

Then:

```bash
npm run db:migrate
npm run dev
```

Runs on `http://localhost:5000`.

Tests: `npm test` (uses `TEST_DATABASE_URL`). Same thing runs in CI before it builds the Docker image.

## Still to do

There's more I want to add:

- Right now booking is instant confirm/reject, want to add a temporary hold (like 5-10 min) while someone's checking out
- Stripe for actual payments
- Background jobs for stuff like confirmation emails
- More tests, I've tested auth but not the double-booking scenario directly, which is the whole point of this project
- API docs
- Better logging, right now it's just console.log