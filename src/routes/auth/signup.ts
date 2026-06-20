import express from 'express'
import { signup } from '../../controllers/auth.controller.js'

const router = express.Router()

router.get('/', (req, res) => { res.send('hi') })
router.post('/', signup)

export default router