import { Router } from 'express'
import { createMovie, findMovies, findMovie, updateMovie, removeMovie, movieSelect } from './movies.controller.js'
import { protect } from '../../middleware/protect.js'
import { isAdmin } from '../../middleware/isAdmin.js'
import { rateLimiter } from '../../middleware/rateLimiter.js'
import { lenientLimiter } from '../../lib/rateLimit.js'

export const moviesRouter = Router()

moviesRouter.get('/', rateLimiter(lenientLimiter), findMovies)
moviesRouter.get('/movieSelect', movieSelect)
moviesRouter.get('/:id', findMovie)
moviesRouter.post('/', protect, isAdmin, createMovie)
moviesRouter.patch('/:id', protect, isAdmin, updateMovie)
moviesRouter.delete('/:id', protect, isAdmin, removeMovie)