import { Router } from 'express'
import { findShowtimes, createShowtime, updateShowtime, findShowtime, removeShowtime } from './showtimes.controller.js'
import { protect } from '../../middleware/protect.js'
import { isAdmin } from '../../middleware/isAdmin.js'

export const showtimesRouter = Router()

showtimesRouter.get('/', findShowtimes)
showtimesRouter.get('/:id', findShowtime)
showtimesRouter.post('/', protect, isAdmin, createShowtime)
showtimesRouter.patch('/:id', protect, isAdmin, updateShowtime)
showtimesRouter.delete('/:id', protect, isAdmin, removeShowtime)