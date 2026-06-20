import express from 'express'
import { protect } from '../../middleware/protect.js'
import { logout } from '../../controllers/auth.controller.js'

const router = express.Router()

router.get('/', (req, res) => { res.send('hi') })
router.post('/', protect, logout)

export default router