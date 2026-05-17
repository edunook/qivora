import express from 'express'
import { createExam, getPublicExams, getExamById } from '../controllers/examController'
import { protect } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/', protect, createExam)
router.get('/public', getPublicExams)
router.get('/:id', getExamById)

export default router
