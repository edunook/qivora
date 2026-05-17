import { Request, Response } from 'express'
import { User } from '../models/User'
import { Exam } from '../models/Exam'
import { ExamResult } from '../models/ExamResult'

// Helper middleware to check if user has admin role
export const checkAdmin = (req: Request, res: Response, next: any) => {
  const user = (req as any).user
  if (user && user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Access Denied: Admin authorization required' })
  }
}

// @desc    Get all platform users with pagination & search
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, role } = req.query
    const query: any = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    if (role && role !== 'all') {
      query.role = role
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 })
    res.status(200).json(users)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Toggle account suspension status
// @route   POST /api/admin/users/:id/suspend
// @access  Private/Admin
export const toggleUserSuspension = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Super Administrators cannot be suspended' })
    }

    user.isSuspended = !user.isSuspended
    await user.save()

    res.status(200).json({
      message: `User ${user.isSuspended ? 'suspended' : 'activated'} successfully`,
      isSuspended: user.isSuspended
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Change user authorization role
// @route   POST /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id
    const { role } = req.body

    const allowedRoles = ['student', 'teacher', 'admin', 'organization', 'user']
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role assignment' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.role = role
    await user.save()

    res.status(200).json({
      message: `User role upgraded to ${role} successfully`,
      role: user.role
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Get all platform exams with violation counts
// @route   GET /api/admin/exams
// @access  Private/Admin
export const getAllExams = async (req: Request, res: Response) => {
  try {
    const exams = await Exam.find()
      .populate('creator', 'name username email')
      .sort({ createdAt: -1 })

    // Map stats including violation rates
    const examsWithStats = await Promise.all(
      exams.map(async (exam: any) => {
        const results = await ExamResult.find({ exam: exam._id })
        const totalViolations = results.reduce((sum, r) => sum + (r.violationsCount || 0), 0)
        const cheatCount = results.filter(r => r.cheated).length

        return {
          _id: exam._id,
          title: exam.title,
          subject: exam.subject,
          creator: exam.creator,
          attempts: exam.attempts || 0,
          rating: exam.rating || 0,
          totalViolations,
          cheatCount,
          createdAt: exam.createdAt,
        }
      })
    )

    res.status(200).json(examsWithStats)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Delete an exam administratively
// @route   DELETE /api/admin/exams/:id
// @access  Private/Admin
export const deleteExam = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id)
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    await exam.deleteOne()
    res.status(200).json({ message: 'Exam deleted successfully by administrator' })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Get system global statistics analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getPlatformAnalytics = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalExams = await Exam.countDocuments()
    const totalResults = await ExamResult.countDocuments()

    const results = await ExamResult.find()
    const totalViolations = results.reduce((sum, r) => sum + (r.violationsCount || 0), 0)
    const cheatedResults = results.filter(r => r.cheated).length

    // Group users by role
    const studentCount = await User.countDocuments({ role: 'student' })
    const teacherCount = await User.countDocuments({ role: 'teacher' })
    const orgCount = await User.countDocuments({ role: 'organization' })
    const adminCount = await User.countDocuments({ role: 'admin' })

    res.status(200).json({
      metrics: {
        totalUsers,
        totalExams,
        totalAttempts: totalResults,
        totalViolations,
        cheatedResults,
        cheatingRate: totalResults > 0 ? parseFloat(((cheatedResults / totalResults) * 100).toFixed(1)) : 0,
      },
      demographics: {
        studentCount,
        teacherCount,
        orgCount,
        adminCount,
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}
