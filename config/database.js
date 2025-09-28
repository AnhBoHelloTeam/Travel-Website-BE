const mongoose = require('mongoose');
const redis = require('redis');

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Redis Connection
let redisClient;
const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    redisClient.on('connect', () => {
      console.log('Redis Connected');
    });
    
    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection error:', error);
    process.exit(1);
  }
};

// Initialize all database connections
const connectDatabases = async () => {
  await connectMongoDB();
  await connectRedis();
};

module.exports = {
  connectDatabases,
  redisClient: () => redisClient
};
