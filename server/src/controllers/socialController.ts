import { Request, Response } from 'express'
import { User } from '../models/User'
import { Exam } from '../models/Exam'

// @desc    Follow or Unfollow a user (creator)
// @route   POST /api/users/follow/:id
// @access  Private
export const toggleFollowCreator = async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.id
    const currentUserId = (req as any).user.id

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' })
    }

    const targetUser = await User.findById(targetUserId)
    const currentUser = await User.findById(currentUserId)

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isFollowing = currentUser.following.includes(targetUserId as any)

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId) as any
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId) as any
      await currentUser.save()
      await targetUser.save()
      return res.status(200).json({ message: 'Successfully unfollowed creator', isFollowing: false })
    } else {
      // Follow
      currentUser.following.push(targetUserId as any)
      targetUser.followers.push(currentUserId as any)
      await currentUser.save()
      await targetUser.save()
      return res.status(200).json({ message: 'Successfully followed creator', isFollowing: true })
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Post a rating and review for an exam
// @route   POST /api/exams/:id/rate
// @access  Private
export const rateExam = async (req: Request, res: Response) => {
  try {
    const examId = req.params.id
    const userId = (req as any).user.id
    const { rating, review } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a rating between 1 and 5' })
    }

    const exam = await Exam.findById(examId)
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    // Check if user already rated
    const existingIndex = exam.ratingsList.findIndex(r => r.user && r.user.toString() === userId)

    if (existingIndex > -1) {
      // Update existing rating
      exam.ratingsList[existingIndex].rating = rating
      exam.ratingsList[existingIndex].review = review || ''
      exam.ratingsList[existingIndex].createdAt = new Date()
    } else {
      // Add new rating
      exam.ratingsList.push({
        user: userId,
        rating,
        review: review || '',
        createdAt: new Date()
      } as any)
    }

    // Recalculate average rating
    const totalRating = exam.ratingsList.reduce((sum, r) => sum + (r.rating || 0), 0)
    exam.rating = parseFloat((totalRating / exam.ratingsList.length).toFixed(1))

    await exam.save()

    res.status(200).json({
      message: 'Review submitted successfully',
      rating: exam.rating,
      ratingsList: exam.ratingsList
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Get user public profile stats & creator metrics
// @route   GET /api/users/profile/:id
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.id
    const currentUserId = (req as any).user.id

    const targetUser = await User.findById(targetUserId)
      .select('-password')
      .populate('followers', 'name username profilePicture')
      .populate('following', 'name username profilePicture')

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get exams created by this user
    const exams = await Exam.find({ creator: targetUserId, isPublic: true })
      .select('title subject duration difficulty rating attempts createdAt')

    const totalAttempts = exams.reduce((sum, exam) => sum + (exam.attempts || 0), 0)
    const avgExamRating = exams.length > 0
      ? parseFloat((exams.reduce((sum, exam) => sum + (exam.rating || 0), 0) / exams.length).toFixed(1))
      : 0

    const isFollowing = targetUser.followers.some((f: any) => f._id.toString() === currentUserId)

    res.status(200).json({
      user: targetUser,
      exams,
      stats: {
        totalExamsCreated: exams.length,
        totalAttempts,
        avgExamRating,
        followersCount: targetUser.followers.length,
        followingCount: targetUser.following.length,
      },
      isFollowing,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Search and filter trending creators & exams
// @route   GET /api/users/creators/trending
// @access  Public
export const getTrendingCreators = async (req: Request, res: Response) => {
  try {
    // Find users who have followers or have created exams
    const creators = await User.find({ role: { $in: ['creator', 'teacher', 'organization'] } })
      .select('name username profilePicture followers following')
      .limit(10)

    const creatorsWithStats = await Promise.all(
      creators.map(async (creator: any) => {
        const examCount = await Exam.countDocuments({ creator: creator._id, isPublic: true })
        return {
          _id: creator._id,
          name: creator.name,
          username: creator.username,
          profilePicture: creator.profilePicture,
          followersCount: creator.followers.length,
          followingCount: creator.following.length,
          examsCreated: examCount,
        }
      })
    )

    // Sort by followers count
    creatorsWithStats.sort((a, b) => b.followersCount - a.followersCount)

    res.status(200).json(creatorsWithStats)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}
