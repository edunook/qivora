import express from 'express'
import { getAllUsers, toggleUserSuspension, updateUserRole, getAllExams, deleteExam, getPlatformAnalytics, checkAdmin } from '../controllers/adminController'
import { protect } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/users', protect, checkAdmin, getAllUsers)
router.post('/users/:id/suspend', protect, checkAdmin, toggleUserSuspension)
router.post('/users/:id/role', protect, checkAdmin, updateUserRole)
router.get('/exams', protect, checkAdmin, getAllExams)
router.delete('/exams/:id', protect, checkAdmin, deleteExam)
router.get('/analytics', protect, checkAdmin, getPlatformAnalytics)

export default router
