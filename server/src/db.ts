/**
 * MongoDB connection (mongoose).
 * MONGO_URI examples:
 *   mongodb://localhost:27017/readmeai              (local/docker)
 *   mongodb+srv://user:pass@cluster.mongodb.net/x   (Atlas)
 */
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/readmeai";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URI);
  console.log(`[db] MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

export default mongoose;
