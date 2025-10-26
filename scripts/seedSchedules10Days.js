const mongoose = require('mongoose');
const Business = require('../models/Business');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
require('dotenv').config();

const seedSchedules10Days = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-website');
    console.log('Connected to MongoDB');

    // Get existing approved businesses
    const businesses = await Business.find({ status: 'approved' });
    if (businesses.length === 0) {
      console.log('❌ No approved businesses found. Please run seedFullData.js first.');
      process.exit(1);
    }
    console.log(`Found ${businesses.length} approved businesses`);

    // Get existing routes
    const routes = await Route.find({ isActive: true });
    if (routes.length === 0) {
      console.log('❌ No active routes found. Please run seedFullData.js first.');
      process.exit(1);
    }
    console.log(`Found ${routes.length} active routes`);

    // Clear existing schedules
    await Schedule.deleteMany({});
    console.log('Cleared existing schedules');

    // Create schedules for next 10 days
    const today = new Date();
    const schedules = [];

    for (let day = 0; day < 10; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      currentDate.setHours(0, 0, 0, 0);

      console.log(`\n📅 Creating schedules for ${currentDate.toLocaleDateString('vi-VN')}`);

      // Create multiple schedules per day for each route and approved business
      for (const route of routes) {
        for (const business of businesses) {
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

          // Late morning schedule (10:00 AM)
          const lateMorningTime = new Date(currentDate);
          lateMorningTime.setHours(10, 0, 0, 0);
          const lateMorningArrival = new Date(lateMorningTime);
          lateMorningArrival.setMinutes(lateMorningArrival.getMinutes() + route.duration);

          schedules.push({
            routeId: route._id,
            departureTime: lateMorningTime,
            arrivalTime: lateMorningArrival,
            price: Math.floor(Math.random() * 200000) + 100000,
            vehicleType: 'sitting',
            vehicleCategory: ['bus16', 'bus32'][Math.floor(Math.random() * 2)],
            capacity: [16, 32][Math.floor(Math.random() * 2)],
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

          // Evening schedule (6:00 PM)
          const eveningTime = new Date(currentDate);
          eveningTime.setHours(18, 0, 0, 0);
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

          // Night schedule (10:00 PM) - only for long routes
          if (route.duration >= 300) { // 5+ hours
            const nightTime = new Date(currentDate);
            nightTime.setHours(22, 0, 0, 0);
            const nightArrival = new Date(nightTime);
            nightArrival.setMinutes(nightArrival.getMinutes() + route.duration);

            schedules.push({
              routeId: route._id,
              departureTime: nightTime,
              arrivalTime: nightArrival,
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
    }

    // Generate seats for each schedule
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
            isAvailable: Math.random() > 0.2, // 80% chance of being available
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
    console.log(`\n✅ Created ${createdSchedules.length} schedules for the next 10 days`);

    // Summary by day
    console.log('\n📊 SCHEDULE SUMMARY BY DAY:');
    for (let day = 0; day < 10; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      currentDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      
      const daySchedules = createdSchedules.filter(s => 
        s.departureTime >= currentDate && s.departureTime < nextDay
      );
      
      console.log(`${currentDate.toLocaleDateString('vi-VN')}: ${daySchedules.length} schedules`);
    }

    // Summary by route
    console.log('\n🚌 SCHEDULE SUMMARY BY ROUTE:');
    for (const route of routes) {
      const routeSchedules = createdSchedules.filter(s => s.routeId.toString() === route._id.toString());
      console.log(`${route.from} → ${route.to}: ${routeSchedules.length} schedules`);
    }

    // Summary by business
    console.log('\n🏢 SCHEDULE SUMMARY BY BUSINESS:');
    for (const business of businesses) {
      const businessSchedules = createdSchedules.filter(s => s.businessId.toString() === business._id.toString());
      console.log(`${business.name}: ${businessSchedules.length} schedules`);
    }

    console.log('\n🎉 Successfully created schedules for 10 days!');
    console.log('\n📅 Available dates:');
    for (let day = 0; day < 10; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      console.log(`- ${currentDate.toLocaleDateString('vi-VN')} (${currentDate.toLocaleDateString('en-US', { weekday: 'long' })})`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding schedules:', error);
    process.exit(1);
  }
};

seedSchedules10Days();
