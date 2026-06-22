import { Router } from 'express'
import { createMovie, findMovies, findMovie, updateMovie, removeMovie } from './movies.controller.js'
import { protect } from '../../middleware/protect.js'
import { isAdmin } from '../../middleware/isAdmin.js'

export const moviesRouter = Router()

moviesRouter.get('/', findMovies)
moviesRouter.get('/:id', findMovie)
moviesRouter.post('/', protect, isAdmin, createMovie)
moviesRouter.patch('/:id', protect, isAdmin, updateMovie)
moviesRouter.delete('/:id', protect, isAdmin, removeMovie)
