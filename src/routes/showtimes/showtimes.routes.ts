import { Router } from 'express'
import { findShowtimes, createShowtime, updateShowtime, findShowtime, removeShowtime } from './showtimes.controller.js'

export const showtimesRouter = Router()

showtimesRouter.get('/', findShowtimes)
showtimesRouter.get('/:id', findShowtime)
showtimesRouter.post('/', createShowtime)
showtimesRouter.patch('/:id', updateShowtime)
showtimesRouter.delete('/:id', removeShowtime)