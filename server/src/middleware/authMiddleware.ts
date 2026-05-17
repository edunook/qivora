import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password')
      
      if (!user) {
        throw new Error('User not found')
      }

      ;(req as any).user = user
      next()
    } catch (error) {
      console.error('Auth Error:', error)
      res.status(401).json({ message: 'Not authorized' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}
