import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer | null = null

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
      console.log('⚠️ No MONGODB_URI found. Starting in-memory MongoDB...')
      mongoServer = await MongoMemoryServer.create()
      mongoUri = mongoServer.getUri()
    }

    try {
      await mongoose.connect(mongoUri)
      console.log(`✅ MongoDB connected successfully to: ${mongoUri}`)
    } catch (connectError) {
      if (process.env.MONGODB_URI) {
        console.error('❌ MongoDB Atlas connection error. Falling back to in-memory MongoDB:', connectError)
        mongoServer = await MongoMemoryServer.create()
        mongoUri = mongoServer.getUri()
        await mongoose.connect(mongoUri)
        console.log(`✅ MongoDB (In-Memory Fallback) connected successfully to: ${mongoUri}`)
      } else {
        throw connectError
      }
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    if (mongoServer) {
      await mongoServer.stop()
    }
  } catch (error) {
    console.error('❌ Error disconnecting MongoDB:', error)
  }
}
