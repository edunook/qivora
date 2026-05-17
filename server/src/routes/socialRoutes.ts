import express from 'express'
import { toggleFollowCreator, rateExam, getUserProfile, getTrendingCreators } from '../controllers/socialController'
import { protect } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/users/follow/:id', protect, toggleFollowCreator)
router.post('/exams/:id/rate', protect, rateExam)
router.get('/users/profile/:id', protect, getUserProfile)
router.get('/creators/trending', getTrendingCreators)

export default router
