import { Router } from 'express'
import { createReservation, getReservation, getReservations, removeReservation, updateReservation } from './reservations.controllers.js'

export const reservationsRouter = Router()

reservationsRouter.get('/', getReservations)
reservationsRouter.get('/:id', getReservation)
reservationsRouter.post('/', createReservation)
reservationsRouter.patch('/:id', updateReservation)
reservationsRouter.delete('/:id', removeReservation)