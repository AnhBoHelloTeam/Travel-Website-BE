const mongoose = require('mongoose');

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-website', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize database connection
const connectDatabases = async () => {
  await connectMongoDB();
};

module.exports = {
  connectDatabases
};
