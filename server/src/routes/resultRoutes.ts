import express from 'express'
import { submitResult, getDashboardStats, getResultById, getResultsByExam } from '../controllers/resultController'
import { protect } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/', protect, submitResult)
router.get('/dashboard', protect, getDashboardStats)
router.get('/exam/:examId', protect, getResultsByExam)
router.get('/:id', protect, getResultById)

export default router
