import { Router } from 'express'
import { findShowtimes, createShowtime, updateShowtime } from './showtimes.controller.js'

export const showtimesRouter = Router()

showtimesRouter.get('/', findShowtimes)
// showtimesRouter.get('/:id')
showtimesRouter.post('/', createShowtime)
showtimesRouter.patch('/:id', updateShowtime)
// showtimesRouter.delete('/:id')