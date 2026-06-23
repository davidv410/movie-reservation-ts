import { Router } from 'express'
import { createReservation, getReservation, getReservations, removeReservation, updateReservation } from './reservations.controllers.js'
import { protect } from '../../middleware/protect.js'

export const reservationsRouter = Router()

reservationsRouter.get('/', getReservations)
reservationsRouter.get('/:id', getReservation)
reservationsRouter.post('/', protect, createReservation)
reservationsRouter.patch('/:id', protect, updateReservation)
reservationsRouter.delete('/:id', protect, removeReservation)