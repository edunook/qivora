import mongoose from "mongoose";
import { env } from "../config/env.js";

let mongoServer: any = null;

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      autoIndex: env.NODE_ENV !== "production"
    } as any);
    console.log("🚀 Connected to MongoDB successfully.");
  } catch (error: any) {
    if (env.NODE_ENV !== "production") {
      console.warn("⚠️ Remote MongoDB connection failed. Falling back to in-memory MongoDB in development...");
      try {
        // @ts-ignore
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        console.log("💾 Connected to In-Memory MongoDB successfully.");
      } catch (memError) {
        console.error("❌ Failed to start In-Memory MongoDB:", memError);
        throw error;
      }
    } else {
      console.error("❌ Production MongoDB connection failed:", error);
      throw error;
    }
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
