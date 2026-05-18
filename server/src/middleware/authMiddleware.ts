import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password')
      
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' })
      }

      ;(req as any).user = user
      return next()
    } catch (error) {
      console.error('Auth Error:', error)
      return res.status(401).json({ message: 'Not authorized, token invalid' })
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' })
}
