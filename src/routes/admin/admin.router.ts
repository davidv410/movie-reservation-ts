import { Router } from 'express'
import { getReservations, getShowtimeReport, getShowtimeReservations } from '../admin/admin.controller.js'
import { protect } from '../../middleware/protect.js'
import { isAdmin } from '../../middleware/isAdmin.js'

export const adminRouter = Router()

adminRouter.get('/reservations', protect, isAdmin, getReservations)
adminRouter.get('/reservations/:id', protect, isAdmin, getShowtimeReservations)
adminRouter.get('/reservations/:id/report', protect, isAdmin, getShowtimeReport)