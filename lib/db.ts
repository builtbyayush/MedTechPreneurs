import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/** Fail fast in serverless — never hang the app shell on a dead Atlas peer. */
const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 8_000,
  connectTimeoutMS: 8_000,
  socketTimeoutMS: 20_000,
  maxPoolSize: 10,
  bufferCommands: false,
} as const;

function getMongoConfig(): { uri: string; dbName: string } {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME ?? "splice";

  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Add it to .env.local (see .env.local.example).",
    );
  }

  return { uri, dbName };
}

/**
 * Connect to MongoDB with a cached connection for Next.js hot reload.
 * Call this from server actions, API routes, and other server code.
 */
export async function connectDB(): Promise<typeof mongoose> {
  const { uri, dbName } = getMongoConfig();

  if (cached.conn) {
    // Drop a dead cached handle so the next call reconnects instead of hanging.
    if (cached.conn.connection.readyState === 1) {
      return cached.conn;
    }
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName,
        ...CONNECT_OPTIONS,
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Returns true when a MongoDB connection is currently cached.
 */
export function isDbConnected(): boolean {
  return cached.conn?.connection.readyState === 1;
}

/**
 * Disconnects the cached MongoDB connection. Intended for scripts and tests.
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
