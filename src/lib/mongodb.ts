import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Reused across hot-reloads / serverless invocations so we don't pay a
// fresh connection round-trip to Atlas on every request.
declare global {
   
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGO_URI environment variable");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
