import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'

import { authRouter } from "./routes/auth/auth.routes.js";
import { moviesRouter } from './routes/movies/movies.routes.js';
import { showtimesRouter } from './routes/showtimes/showtimes.routes.js';
import { reservationsRouter } from './routes/reservations/reservations.routes.js';
import { adminRouter } from './routes/admin/admin.router.js';
import {seatsRouter} from "./routes/seats/seats.routes.js";
import {genresRoutes} from "./routes/genres/genres.routes.js";
import { serverAdapter } from './lib/bull-board.js';

import { stripeWebhook } from './routes/stripe/stripeWebhook.js';

import { isAdmin } from './middleware/isAdmin.js';
import { protect } from './middleware/protect.js';

const app = express()

app.use(cors({
    origin: [
        'https://movie-reservation-frontend-tau.vercel.app',
        'https://www.movie-reservation-frontend-tau.vercel.app',
        'http://localhost:5173',
    ],
    credentials: true,
}));

app.post("/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/movies', moviesRouter)
app.use('/showtimes', showtimesRouter)
app.use('/reservations', reservationsRouter)
app.use('/admin', adminRouter)
app.use('/seats', seatsRouter)
app.use('/genres', genresRoutes)

app.use("/admin/queues", protect, isAdmin, serverAdapter.getRouter());

app.use(errorHandler);

export default app