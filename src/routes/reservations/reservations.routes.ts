import { Router } from 'express'
import { createReservation, getReservation, getReservations, removeReservation } from './reservations.controllers.js'
import { protect } from '../../middleware/protect.js'

export const reservationsRouter = Router()

reservationsRouter.get('/', protect, getReservations)
reservationsRouter.get('/:id', protect, getReservation)
reservationsRouter.post('/', protect, createReservation)
reservationsRouter.delete('/:id', protect, removeReservation)