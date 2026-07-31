import { Router } from 'express'
import { createReservation, getReservation, getReservations, removeReservation } from './reservations.controllers.js'
import { protect } from '../../middleware/protect.js'
import { rateLimiter } from '../../middleware/rateLimiter.js'
import { moderateLimiter } from '../../lib/rateLimit.js'

export const reservationsRouter = Router()

reservationsRouter.get('/', protect, getReservations)
reservationsRouter.get('/:id', protect, getReservation)
reservationsRouter.post('/', rateLimiter(moderateLimiter) ,protect, createReservation)
reservationsRouter.delete('/:id', protect, removeReservation)