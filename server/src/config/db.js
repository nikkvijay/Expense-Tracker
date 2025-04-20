const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
};

const connectDB = async () => {
  try {
    // Check if MONGODB_URL is defined
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined in environment variables");
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URL, options);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handler
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();

    process.exit(0);
  } catch (err) {
    console.error("Error during database disconnection:", err);
    process.exit(1);
  }
});

module.exports = connectDB;
