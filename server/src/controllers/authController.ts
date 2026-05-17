import { Request, Response } from 'express'
import { User } from '../models/User'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendEmail } from '../utils/sendEmail'

// Helper to generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  })
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, profilePicture } = req.body

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields' })
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] })
    if (userExists) {
      return res.status(400).json({ message: 'User with email or username already exists' })
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
      profilePicture: profilePicture || undefined, // Uses schema default if undefined
    })

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (user && (await (user as any).matchPassword(password))) {
      if ((user as any).isSuspended) {
        return res.status(403).json({ message: 'Your account has been suspended by an administrator.' })
      }
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      })
    } else {
      res.status(401).json({ message: 'Invalid credentials' })
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
  try {
    // req.user is set in the authMiddleware
    const user = await User.findById((req as any).user.id)
    res.status(200).json(user)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Forgot password - send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email' })
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Save hashed token and expiry (15 minutes) to the user document
    user.passwordResetToken = hashedToken
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()

    // Build the reset URL (points to the frontend page)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin: 0; color: #8b5cf6;">Qivora</h1>
          <p style="color: #888; font-size: 14px;">Password Reset Request</p>
        </div>
        <p style="font-size: 16px; color: #ccc;">Hi <strong>${user.name}</strong>,</p>
        <p style="font-size: 14px; color: #aaa; line-height: 1.6;">
          We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>15 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #666; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <hr style="border: none; border-top: 1px solid #222; margin: 30px 0;" />
        <p style="font-size: 11px; color: #555; text-align: center;">© ${new Date().getFullYear()} Qivora. All rights reserved.</p>
      </div>
    `

    await sendEmail({
      email: user.email,
      subject: 'Qivora - Password Reset',
      html,
    })

    res.status(200).json({ message: 'Password reset link sent to your email' })
  } catch (error: any) {
    console.error('Forgot Password Error:', error)
    res.status(500).json({ message: 'Failed to send reset email. Please try again later.' })
  }
}

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body
    const { token } = req.params

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Hash the incoming token to compare with the stored hashed version
    const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    // Set new password (the pre-save hook will hash it)
    user.password = password
    user.passwordResetToken = undefined as any
    user.passwordResetExpires = undefined as any
    await user.save()

    res.status(200).json({ message: 'Password reset successful! You can now sign in.' })
  } catch (error: any) {
    console.error('Reset Password Error:', error)
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

