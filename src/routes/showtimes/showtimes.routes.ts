import { Router } from 'express'
import { findShowtimes, createShowtime } from './showtimes.controller.js'

export const showtimesRouter = Router()

showtimesRouter.get('/', findShowtimes)
// showtimesRouter.get('/:id')
showtimesRouter.post('/', createShowtime)
// showtimesRouter.patch('/:id')
// showtimesRouter.delete('/:id')