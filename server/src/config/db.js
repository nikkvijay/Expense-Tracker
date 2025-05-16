const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined in environment variables");
    }
    cached.promise = mongoose.connect(process.env.MONGODB_URL, options).then((mongoose) => {
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
  return cached.conn;
};

// Graceful shutdown handler
/* Graceful shutdown is not needed in serverless environments */

module.exports = connectDB;
