// lib/mongodb.ts
// Centralized, type-safe MongoDB connection using Mongoose with connection caching.
// This avoids creating multiple connections during Next.js hot-reloads in development.

import mongoose from "mongoose";

// Strongly typed cache stored on the Node.js global object so it persists across reloads.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the Node global type to include our cache (avoids using `any`).
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.length === 0) {
  // Fail fast with a clear message if the required env var is missing.
  throw new Error(
    "Please define the MONGODB_URI environment variable (connection string)"
  );
}

// Reuse an existing cache if present; otherwise initialize a new one.
const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes (and caches) a Mongoose connection.
 * - Returns immediately if a cached connection exists.
 * - In-flight connection attempts are shared via a cached promise to prevent races.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
      // Validate MongoDB URI exists
      if (!MONGODB_URI) {
          throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
      }
    // Minimal, safe defaults; respect connection string options.
    // bufferCommands: false ensures Mongoose doesn't queue operations if disconnected.
    const options = { bufferCommands: false } as const;

    cached.promise = mongoose.connect(MONGODB_URI!, options).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Optional helper to disconnect, useful for testing/CLI scripts.
 * Not typically invoked in long-running server processes.
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

export default connectDB;
