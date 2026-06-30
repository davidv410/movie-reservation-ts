import {Router} from 'express'
import {findSeats} from "./seats.controllers.js";

export const seatsRouter = Router()

seatsRouter.get('/showtimes/:id', findSeats)