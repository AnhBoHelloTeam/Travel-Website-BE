const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test 1: Check if users exist
    const users = await User.find({});
    console.log(`\nFound ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive}`);
    });

    // Test 2: Try to find specific user
    const adminUser = await User.findOne({ email: 'admin@travel.com' }).select('+password');
    if (adminUser) {
      console.log(`\nFound admin user: ${adminUser.email}`);
      console.log(`Password hash: ${adminUser.password.substring(0, 20)}...`);
      
      // Test 3: Try to verify password
      const testPassword = 'admin123';
      const isPasswordValid = await adminUser.comparePassword(testPassword);
      console.log(`Password '${testPassword}' is valid: ${isPasswordValid}`);
      
      // Test 4: Try to hash the same password
      const hashedTestPassword = await bcrypt.hash(testPassword, 12);
      console.log(`New hash for '${testPassword}': ${hashedTestPassword.substring(0, 20)}...`);
      
      // Test 5: Compare with bcrypt directly
      const directCompare = await bcrypt.compare(testPassword, adminUser.password);
      console.log(`Direct bcrypt compare: ${directCompare}`);
      
    } else {
      console.log('\n❌ Admin user not found!');
    }

    // Test 6: Create a test user with known password
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('test123', 12);
      const newUser = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        role: 'customer',
        profile: {
          firstName: 'Test',
          lastName: 'User',
          phone: '0123456789'
        },
        isVerified: true,
        isActive: true
      });
      console.log(`\n✅ Created test user: ${newUser.email}`);
      
      // Test login for new user
      const loginTest = await newUser.comparePassword('test123');
      console.log(`Test user login works: ${loginTest}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testLogin();
