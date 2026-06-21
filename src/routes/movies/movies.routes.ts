import { Router } from 'express'
import { createMovie, findMovies, findMovie, updateMovie, removeMovie } from './movies.controller.js'
import { protect } from '../../middleware/protect.js'

export const moviesRouter = Router()

moviesRouter.get('/', findMovies)
moviesRouter.get('/:id', findMovie)
moviesRouter.post('/', protect, createMovie)
moviesRouter.patch('/:id', protect, updateMovie)
moviesRouter.delete('/:id', protect, removeMovie)
