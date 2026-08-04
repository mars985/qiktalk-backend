const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined. Please check your .env file.");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Successfully connected to MongoDB: ${process.env.MONGO_URI}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDb;
