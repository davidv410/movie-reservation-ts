import 'dotenv/config'
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

const app = express()

app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true,
}));
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/movies', moviesRouter)
app.use('/showtimes', showtimesRouter)
app.use('/reservations', reservationsRouter)
app.use('/admin', adminRouter)
app.use('/seats', seatsRouter)

app.use(errorHandler);

export default app