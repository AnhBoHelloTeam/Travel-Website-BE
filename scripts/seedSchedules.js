const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const User = require('../models/User');
require('dotenv').config();

// Helper function to generate seats based on layout
function generateSeats(capacity, seatLayout) {
  const seats = [];
  const layoutParts = seatLayout.split('-').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n));
  const colsPerRow = layoutParts.length > 0 ? layoutParts.reduce((sum, val) => sum + val, 0) : 4;
  
  let seatIndex = 1;
  for (let row = 1; row <= Math.ceil(capacity / colsPerRow); row++) {
    for (let col = 0; col < colsPerRow && seatIndex <= capacity; col++) {
      const colChar = String.fromCharCode(65 + col); // A, B, C, D...
      const seatNumber = `${row}${colChar}`;
      
      // First row = VIP, rest = normal
      const seatType = row === 1 ? 'vip' : 'normal';
      
      // Randomly make some seats unavailable (simulate bookings)
      const isAvailable = Math.random() > 0.3; // 70% chance of being available
      
      seats.push({
        seatNumber,
        isAvailable,
        seatType
      });
      seatIndex++;
    }
  }
  return seats;
}

async function seedSchedules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get routes and business users
    const routes = await Route.find({ isActive: true });
    const businessUsers = await User.find({ role: 'business' });
    
    if (routes.length === 0) {
      console.log('No routes found. Please run seed:routes first.');
      return;
    }
    
    if (businessUsers.length === 0) {
      console.log('No business users found. Please create business users first.');
      return;
    }

    // Clear existing schedules
    await Schedule.deleteMany({});
    console.log('Cleared existing schedules');

    // Generate schedules for next 7 days
    const sampleSchedules = []
    const baseDate = new Date()
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(baseDate)
      currentDate.setDate(baseDate.getDate() + dayOffset)
      
      // Multiple schedules per day
      const schedulesPerDay = [
        {
          routeId: routes[0]._id,
          departureTime: new Date(currentDate.setHours(8, 0, 0, 0)),
          arrivalTime: new Date(currentDate.getTime() + 3 * 60 * 60 * 1000),
          price: 250000,
          vehicleType: 'sitting',
          vehicleCategory: 'bus32',
          capacity: 32,
          seatLayout: '2-2',
          businessId: businessUsers[0]._id,
          status: 'active'
        },
        {
          routeId: routes[0]._id,
          departureTime: new Date(currentDate.setHours(14, 0, 0, 0)),
          arrivalTime: new Date(currentDate.getTime() + 3 * 60 * 60 * 1000),
          price: 300000,
          vehicleType: 'sleeping',
          vehicleCategory: 'sleeper',
          capacity: 40,
          seatLayout: '2-1-2',
          businessId: businessUsers[0]._id,
          status: 'active'
        },
        {
          routeId: routes[1] ? routes[1]._id : routes[0]._id,
          departureTime: new Date(currentDate.setHours(20, 0, 0, 0)),
          arrivalTime: new Date(currentDate.getTime() + 6 * 60 * 60 * 1000),
          price: 500000,
          vehicleType: 'sitting',
          vehicleCategory: 'limousine',
          capacity: 12,
          seatLayout: '2-1',
          businessId: businessUsers[0]._id,
          status: 'active'
        }
      ]
      
      sampleSchedules.push(...schedulesPerDay)
    }

    // Generate seats for each schedule
    const schedulesWithSeats = sampleSchedules.map(schedule => ({
      ...schedule,
      seats: generateSeats(schedule.capacity, schedule.seatLayout),
      maxSeats: schedule.capacity
    }));

    const createdSchedules = await Schedule.insertMany(schedulesWithSeats);
    console.log(`Created ${createdSchedules.length} schedules with seat maps`);

    // Display created schedules
    createdSchedules.forEach(schedule => {
      const availableSeats = schedule.seats.filter(s => s.isAvailable).length;
      const vipSeats = schedule.seats.filter(s => s.seatType === 'vip').length;
      console.log(`\nSchedule: ${schedule.vehicleCategory} (${schedule.capacity} seats, ${schedule.seatLayout})`);
      console.log(`  Available: ${availableSeats}/${schedule.capacity}`);
      console.log(`  VIP seats: ${vipSeats}`);
      console.log(`  Price: ${schedule.price.toLocaleString()} đ`);
    });

  } catch (error) {
    console.error('Error seeding schedules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seedSchedules();
}

module.exports = { seedSchedules };

