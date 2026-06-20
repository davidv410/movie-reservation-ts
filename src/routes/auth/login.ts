import express from 'express'
import { login } from '../../controllers/auth.controller.js'

const router = express.Router()

router.get('/', (req, res) => { res.send('hi') })
router.post('/', login)

export default router