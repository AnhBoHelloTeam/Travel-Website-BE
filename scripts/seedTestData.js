const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Business = require('../models/Business');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
require('dotenv').config();

const seedTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-website');
    console.log('Connected to MongoDB');

    // Clear existing test data
    await User.deleteMany({ email: { $regex: /test/ } });
    await Business.deleteMany({ email: { $regex: /test/ } });
    await Schedule.deleteMany({});
    console.log('Cleared existing test data');

    // Create test users
    const testUsers = [
      {
        email: 'testbusiness1@example.com',
        password: '123456',
        role: 'business',
        profile: {
          firstName: 'Nguyễn',
          lastName: 'Văn A',
          phone: '0123456789',
          address: '123 Đường ABC, Quận 1, TP.HCM'
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'testbusiness2@example.com',
        password: '123456',
        role: 'business',
        profile: {
          firstName: 'Trần',
          lastName: 'Thị B',
          phone: '0987654321',
          address: '456 Đường XYZ, Quận 2, TP.HCM'
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'testcustomer@example.com',
        password: '123456',
        role: 'customer',
        profile: {
          firstName: 'Lê',
          lastName: 'Văn C',
          phone: '0555666777',
          address: '789 Đường DEF, Quận 3, TP.HCM'
        },
        isVerified: true,
        isActive: true
      }
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create test businesses
    const testBusinesses = [
      {
        name: 'Xe Khách Phương Trang',
        license: 'PT001',
        email: 'testbusiness1@example.com',
        phone: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        description: 'Nhà xe uy tín với nhiều năm kinh nghiệm',
        services: ['sitting', 'sleeping', 'vip'],
        status: 'approved',
        ownerId: createdUsers[0]._id
      },
      {
        name: 'Xe Khách Hoàng Long',
        license: 'HL002',
        email: 'testbusiness2@example.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        description: 'Dịch vụ xe khách chất lượng cao',
        services: ['sitting', 'sleeping'],
        status: 'approved',
        ownerId: createdUsers[1]._id
      }
    ];

    const createdBusinesses = [];
    for (const businessData of testBusinesses) {
      const business = await Business.create(businessData);
      createdBusinesses.push(business);
      console.log(`Created business: ${business.name}`);
    }

    // Get existing routes
    const routes = await Route.find({ isActive: true });
    if (routes.length === 0) {
      console.log('No routes found. Please run: npm run seed:routes');
      process.exit(1);
    }

    // Create schedules for the next 7 days
    const today = new Date();
    const schedules = [];

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      currentDate.setHours(0, 0, 0, 0);

      // Create multiple schedules per day for each route and business
      for (const route of routes) {
        for (const business of createdBusinesses) {
          // Morning schedule (6:00 AM)
          const morningTime = new Date(currentDate);
          morningTime.setHours(6, 0, 0, 0);
          const morningArrival = new Date(morningTime);
          morningArrival.setMinutes(morningArrival.getMinutes() + route.duration);

          schedules.push({
            routeId: route._id,
            departureTime: morningTime,
            arrivalTime: morningArrival,
            price: Math.floor(Math.random() * 200000) + 100000, // 100k-300k
            vehicleType: 'sitting',
            vehicleCategory: ['bus16', 'bus32', 'limousine'][Math.floor(Math.random() * 3)],
            capacity: [16, 32, 40][Math.floor(Math.random() * 3)],
            seatLayout: '2-2',
            businessId: business._id,
            status: 'active'
          });

          // Afternoon schedule (2:00 PM)
          const afternoonTime = new Date(currentDate);
          afternoonTime.setHours(14, 0, 0, 0);
          const afternoonArrival = new Date(afternoonTime);
          afternoonArrival.setMinutes(afternoonArrival.getMinutes() + route.duration);

          schedules.push({
            routeId: route._id,
            departureTime: afternoonTime,
            arrivalTime: afternoonArrival,
            price: Math.floor(Math.random() * 200000) + 100000,
            vehicleType: 'sleeping',
            vehicleCategory: ['sleeper', 'sitting'][Math.floor(Math.random() * 2)],
            capacity: [16, 32][Math.floor(Math.random() * 2)],
            seatLayout: '2-1',
            businessId: business._id,
            status: 'active'
          });

          // Evening schedule (8:00 PM)
          const eveningTime = new Date(currentDate);
          eveningTime.setHours(20, 0, 0, 0);
          const eveningArrival = new Date(eveningTime);
          eveningArrival.setMinutes(eveningArrival.getMinutes() + route.duration);

          schedules.push({
            routeId: route._id,
            departureTime: eveningTime,
            arrivalTime: eveningArrival,
            price: Math.floor(Math.random() * 200000) + 100000,
            vehicleType: 'sleeping',
            vehicleCategory: 'sleeper',
            capacity: 16,
            seatLayout: '2-1',
            businessId: business._id,
            status: 'active'
          });
        }
      }
    }

    // Create schedules with auto-generated seats
    for (const scheduleData of schedules) {
      const total = scheduleData.capacity;
      const seatLayout = scheduleData.seatLayout;
      const seats = [];
      
      // Parse seat layout (e.g., "2-2" -> [2, 2], "2-1" -> [2, 1])
      const layoutParts = seatLayout.split('-').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n));
      const colsPerRow = layoutParts.length > 0 ? layoutParts.reduce((sum, val) => sum + val, 0) : 4;
      
      let seatIndex = 1;
      for (let row = 1; row <= Math.ceil(total / colsPerRow); row++) {
        for (let col = 0; col < colsPerRow && seatIndex <= total; col++) {
          const colChar = String.fromCharCode(65 + col); // A, B, C, D...
          const seatNumber = `${row}${colChar}`;
          
          // Determine seat type based on position (first row = VIP, rest = normal)
          const seatType = row === 1 ? 'vip' : 'normal';
          
          seats.push({
            seatNumber,
            isAvailable: true,
            seatType
          });
          seatIndex++;
        }
      }
      
      scheduleData.seats = seats;
      scheduleData.maxSeats = total;
    }

    // Insert all schedules
    const createdSchedules = await Schedule.insertMany(schedules);
    console.log(`Created ${createdSchedules.length} schedules for the next 7 days`);

    console.log('\n✅ Test data seeded successfully!');
    console.log('\nTest accounts:');
    console.log('Business 1: testbusiness1@example.com / 123456');
    console.log('Business 2: testbusiness2@example.com / 123456');
    console.log('Customer: testcustomer@example.com / 123456');
    console.log('\nAll businesses are approved and ready to use.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
};

seedTestData();
