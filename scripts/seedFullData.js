const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Business = require('../models/Business');
const Route = require('../models/Route');
const RouteStop = require('../models/RouteStop');
const Schedule = require('../models/Schedule');
const Ticket = require('../models/Ticket');
require('dotenv').config();

const seedFullData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-website');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Business.deleteMany({});
    await Route.deleteMany({});
    await RouteStop.deleteMany({});
    await Schedule.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Cleared existing data');

    // 1. CREATE USERS (All 3 roles)
    const users = [
      // Admin users
      {
        email: 'admin@travel.com',
        password: 'admin123',
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'System',
          phone: '0123456789',
          address: '123 Admin Street, District 1, HCMC'
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'admin2@travel.com',
        password: 'admin123',
        role: 'admin',
        profile: {
          firstName: 'Super',
          lastName: 'Admin',
          phone: '0987654321',
          address: '456 Admin Avenue, District 2, HCMC'
        },
        isVerified: true,
        isActive: true
      },
      
      // Business users
      {
        email: 'phuongtrang@example.com',
        password: 'business123',
        role: 'business',
        profile: {
          firstName: 'Nguyễn',
          lastName: 'Văn A',
          phone: '0123456789',
          address: '123 Business Street, District 1, HCMC'
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'hoanglong@example.com',
        password: 'business123',
        role: 'business',
        profile: {
          firstName: 'Trần',
          lastName: 'Thị B',
          phone: '0987654321',
          address: '456 Business Avenue, District 2, HCMC'
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'thanhbuoi@example.com',
        password: 'business123',
        role: 'business',
        profile: {
          firstName: 'Lê',
          lastName: 'Văn C',
          phone: '0555666777',
          address: '789 Business Road, District 3, HCMC'
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'kumho@example.com',
        password: 'business123',
        role: 'business',
        profile: {
          firstName: 'Phạm',
          lastName: 'Thị D',
          phone: '0333444555',
          address: '321 Business Lane, District 4, HCMC'
        },
        isVerified: true,
        isActive: true
      },
      
      // Customer users
      {
        email: 'customer1@example.com',
        password: 'customer123',
        role: 'customer',
        profile: {
          firstName: 'Nguyễn',
          lastName: 'Văn E',
          phone: '0111222333',
          address: '111 Customer Street, District 5, HCMC'
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'customer2@example.com',
        password: 'customer123',
        role: 'customer',
        profile: {
          firstName: 'Trần',
          lastName: 'Thị F',
          phone: '0444555666',
          address: '222 Customer Avenue, District 6, HCMC'
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'customer3@example.com',
        password: 'customer123',
        role: 'customer',
        profile: {
          firstName: 'Lê',
          lastName: 'Văn G',
          phone: '0777888999',
          address: '333 Customer Road, District 7, HCMC'
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'customer4@example.com',
        password: 'customer123',
        role: 'customer',
        profile: {
          firstName: 'Phạm',
          lastName: 'Thị H',
          phone: '0888999000',
          address: '444 Customer Lane, District 8, HCMC'
        },
        isVerified: true,
        isActive: true
      }
    ];

    // Create users (password will be hashed by User model pre-save hook)
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    // 2. CREATE BUSINESSES
    const businesses = [
      {
        name: 'Xe Khách Phương Trang',
        license: 'PT001',
        email: 'phuongtrang@example.com',
        phone: '0123456789',
        address: '123 Phương Trang Street, District 1, HCMC',
        description: 'Nhà xe uy tín với nhiều năm kinh nghiệm, phục vụ khách hàng tận tình',
        services: ['sitting', 'sleeping', 'vip'],
        status: 'approved',
        ownerId: createdUsers.find(u => u.email === 'phuongtrang@example.com')._id,
        rating: { average: 4.5, count: 120 }
      },
      {
        name: 'Xe Khách Hoàng Long',
        license: 'HL002',
        email: 'hoanglong@example.com',
        phone: '0987654321',
        address: '456 Hoàng Long Avenue, District 2, HCMC',
        description: 'Dịch vụ xe khách chất lượng cao, xe mới, tài xế kinh nghiệm',
        services: ['sitting', 'sleeping'],
        status: 'approved',
        ownerId: createdUsers.find(u => u.email === 'hoanglong@example.com')._id,
        rating: { average: 4.2, count: 85 }
      },
      {
        name: 'Xe Khách Thanh Bưởi',
        license: 'TB003',
        email: 'thanhbuoi@example.com',
        phone: '0555666777',
        address: '789 Thanh Bưởi Road, District 3, HCMC',
        description: 'Chuyên tuyến đường dài, xe giường nằm tiện nghi',
        services: ['sleeping', 'vip'],
        status: 'approved',
        ownerId: createdUsers.find(u => u.email === 'thanhbuoi@example.com')._id,
        rating: { average: 4.0, count: 65 }
      },
      {
        name: 'Xe Khách Kumho',
        license: 'KH004',
        email: 'kumho@example.com',
        phone: '0333444555',
        address: '321 Kumho Lane, District 4, HCMC',
        description: 'Xe khách hiện đại, dịch vụ chuyên nghiệp',
        services: ['sitting', 'sleeping', 'vip'],
        status: 'pending', // One business pending for admin to approve
        ownerId: createdUsers.find(u => u.email === 'kumho@example.com')._id,
        rating: { average: 0, count: 0 }
      }
    ];

    const createdBusinesses = [];
    for (const businessData of businesses) {
      const business = await Business.create(businessData);
      createdBusinesses.push(business);
      console.log(`Created business: ${business.name} (${business.status})`);
    }

    // 3. CREATE ROUTES
    const routes = [
      {
        from: 'TP. Hồ Chí Minh',
        to: 'Hà Nội',
        distance: 1720, // km
        duration: 1440, // 24 hours
        stops: [
          {
            name: 'Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM',
            coordinates: { lat: 10.8231, lng: 106.6297 },
            type: 'bus_station',
            order: 1,
            estimatedTime: 0,
            isActive: true
          },
          {
            name: 'Văn phòng TP.HCM',
            address: '321 Nguyễn Văn Cừ, Quận 5, TP.HCM',
            coordinates: { lat: 10.7500, lng: 106.6500 },
            type: 'office',
            order: 2,
            estimatedTime: 30,
            isActive: true
          },
          {
            name: 'Bến xe Đà Nẵng',
            address: 'Tôn Đức Thắng, Hải Châu, Đà Nẵng',
            coordinates: { lat: 16.0544, lng: 108.2022 },
            type: 'bus_station',
            order: 3,
            estimatedTime: 720,
            isActive: true
          },
          {
            name: 'Bến xe Mỹ Đình',
            address: 'Mỹ Đình, Nam Từ Liêm, Hà Nội',
            coordinates: { lat: 21.0285, lng: 105.7542 },
            type: 'bus_station',
            order: 4,
            estimatedTime: 1440,
            isActive: true
          }
        ],
        isActive: true
      },
      {
        from: 'TP. Hồ Chí Minh',
        to: 'Đà Nẵng',
        distance: 860,
        duration: 720, // 12 hours
        stops: [
          {
            name: 'Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM',
            coordinates: { lat: 10.8231, lng: 106.6297 },
            type: 'bus_station',
            order: 1,
            estimatedTime: 0,
            isActive: true
          },
          {
            name: 'Văn phòng TP.HCM',
            address: '321 Nguyễn Văn Cừ, Quận 5, TP.HCM',
            coordinates: { lat: 10.7500, lng: 106.6500 },
            type: 'office',
            order: 2,
            estimatedTime: 30,
            isActive: true
          },
          {
            name: 'Bến xe Đà Nẵng',
            address: 'Tôn Đức Thắng, Hải Châu, Đà Nẵng',
            coordinates: { lat: 16.0544, lng: 108.2022 },
            type: 'bus_station',
            order: 3,
            estimatedTime: 720,
            isActive: true
          }
        ],
        isActive: true
      },
      {
        from: 'TP. Hồ Chí Minh',
        to: 'Vũng Tàu',
        distance: 125,
        duration: 180, // 3 hours
        stops: [
          {
            name: 'Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM',
            coordinates: { lat: 10.8231, lng: 106.6297 },
            type: 'bus_station',
            order: 1,
            estimatedTime: 0,
            isActive: true
          },
          {
            name: 'Văn phòng TP.HCM',
            address: '321 Nguyễn Văn Cừ, Quận 5, TP.HCM',
            coordinates: { lat: 10.7500, lng: 106.6500 },
            type: 'office',
            order: 2,
            estimatedTime: 30,
            isActive: true
          },
          {
            name: 'Bến xe Vũng Tàu',
            address: 'Thùy Vân, Vũng Tàu, Bà Rịa - Vũng Tàu',
            coordinates: { lat: 10.3460, lng: 107.0843 },
            type: 'bus_station',
            order: 3,
            estimatedTime: 180,
            isActive: true
          }
        ],
        isActive: true
      },
      {
        from: 'Hà Nội',
        to: 'Hải Phòng',
        distance: 120,
        duration: 150, // 2.5 hours
        stops: [
          {
            name: 'Bến xe Mỹ Đình',
            address: 'Mỹ Đình, Nam Từ Liêm, Hà Nội',
            coordinates: { lat: 21.0285, lng: 105.7542 },
            type: 'bus_station',
            order: 1,
            estimatedTime: 0,
            isActive: true
          },
          {
            name: 'Văn phòng Hà Nội',
            address: '789 Giải Phóng, Hai Bà Trưng, Hà Nội',
            coordinates: { lat: 21.0200, lng: 105.8500 },
            type: 'office',
            order: 2,
            estimatedTime: 30,
            isActive: true
          },
          {
            name: 'Bến xe Hải Phòng',
            address: 'Lê Chân, Hải Phòng',
            coordinates: { lat: 20.8449, lng: 106.6881 },
            type: 'bus_station',
            order: 3,
            estimatedTime: 150,
            isActive: true
          }
        ],
        isActive: true
      },
      {
        from: 'Đà Nẵng',
        to: 'Huế',
        distance: 100,
        duration: 120, // 2 hours
        stops: [
          {
            name: 'Bến xe Đà Nẵng',
            address: 'Tôn Đức Thắng, Hải Châu, Đà Nẵng',
            coordinates: { lat: 16.0544, lng: 108.2022 },
            type: 'bus_station',
            order: 1,
            estimatedTime: 0,
            isActive: true
          },
          {
            name: 'Văn phòng Đà Nẵng',
            address: '123 Lê Duẩn, Hải Châu, Đà Nẵng',
            coordinates: { lat: 16.0600, lng: 108.2100 },
            type: 'office',
            order: 2,
            estimatedTime: 15,
            isActive: true
          },
          {
            name: 'Bến xe Huế',
            address: 'An Cựu, Huế, Thừa Thiên Huế',
            coordinates: { lat: 16.4637, lng: 107.5909 },
            type: 'bus_station',
            order: 3,
            estimatedTime: 120,
            isActive: true
          }
        ],
        isActive: true
      }
    ];

    const createdRoutes = [];
    for (const routeData of routes) {
      const { stops, ...routeInfo } = routeData;
      
      // Create route
      const route = await Route.create(routeInfo);
      createdRoutes.push(route);
      console.log(`Created route: ${route.from} -> ${route.to}`);

      // Create route stops
      for (const stopData of stops) {
        await RouteStop.create({
          routeId: route._id,
          name: stopData.name,
          address: stopData.address,
          estimatedTime: stopData.estimatedTime,
          order: stopData.order
        });
      }
      console.log(`Created ${stops.length} stops for route ${route.from} -> ${route.to}`);
    }

    // 4. CREATE SCHEDULES (Next 7 days)
    const today = new Date();
    const schedules = [];

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      currentDate.setHours(0, 0, 0, 0);

      // Create multiple schedules per day for each route and approved business
      for (const route of createdRoutes) {
        for (const business of createdBusinesses.filter(b => b.status === 'approved')) {
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
            isAvailable: Math.random() > 0.3, // 70% chance of being available
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

    // 5. CREATE TICKETS (Some bookings for testing)
    const tickets = [];
    const customerUsers = createdUsers.filter(u => u.role === 'customer');
    
    // Create some tickets for the first few schedules
    for (let i = 0; i < Math.min(20, createdSchedules.length); i++) {
      const schedule = createdSchedules[i];
      const customer = customerUsers[Math.floor(Math.random() * customerUsers.length)];
      
      // Find an available seat
      const availableSeat = schedule.seats.find(seat => seat.isAvailable);
      if (availableSeat) {
        // Get route details
        const route = createdRoutes.find(r => r._id.toString() === schedule.routeId.toString());
        const pickupStop = { name: 'Bến xe', address: 'Điểm đón', estimatedTime: 0 };
        const dropoffStop = { name: 'Bến xe', address: 'Điểm đến', estimatedTime: route?.duration || 0 };
        
        tickets.push({
          userId: customer._id,
          scheduleId: schedule._id,
          seatNumber: availableSeat.seatNumber,
          status: ['pending', 'confirmed', 'confirmed'][Math.floor(Math.random() * 3)],
          pickupPoint: {
            name: pickupStop.name,
            address: pickupStop.address,
            estimatedTime: pickupStop.estimatedTime
          },
          dropoffPoint: {
            name: dropoffStop.name,
            address: dropoffStop.address,
            estimatedTime: dropoffStop.estimatedTime
          },
          passengerInfo: {
            firstName: customer.profile.firstName,
            lastName: customer.profile.lastName,
            phone: customer.profile.phone,
            email: customer.email
          },
          paymentInfo: {
            method: ['momo', 'vnpay', 'cash'][Math.floor(Math.random() * 3)],
            transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            amount: schedule.price,
            status: ['pending', 'completed', 'completed'][Math.floor(Math.random() * 3)],
            paidAt: new Date()
          }
        });
      }
    }

    // Insert tickets
    const createdTickets = await Ticket.insertMany(tickets);
    console.log(`Created ${createdTickets.length} tickets`);

    // Update seat availability based on tickets
    for (const ticket of createdTickets) {
      const schedule = await Schedule.findById(ticket.scheduleId);
      if (schedule) {
        const seatIndex = schedule.seats.findIndex(seat => seat.seatNumber === ticket.seatNumber);
        if (seatIndex !== -1) {
          schedule.seats[seatIndex].isAvailable = false;
          await schedule.save();
        }
      }
    }

    console.log('\n✅ Full data seeded successfully!');
    console.log('\n📋 ACCOUNTS CREATED:');
    console.log('\n🔑 ADMIN ACCOUNTS:');
    console.log('admin@travel.com / admin123');
    console.log('admin2@travel.com / admin123');
    
    console.log('\n🏢 BUSINESS ACCOUNTS:');
    console.log('phuongtrang@example.com / business123 (APPROVED)');
    console.log('hoanglong@example.com / business123 (APPROVED)');
    console.log('thanhbuoi@example.com / business123 (APPROVED)');
    console.log('kumho@example.com / business123 (PENDING - for admin to approve)');
    
    console.log('\n👤 CUSTOMER ACCOUNTS:');
    console.log('customer1@example.com / customer123');
    console.log('customer2@example.com / customer123');
    console.log('customer3@example.com / customer123');
    console.log('customer4@example.com / customer123');
    
    console.log('\n📊 DATA SUMMARY:');
    console.log(`- ${createdUsers.length} users (2 admin, 4 business, 4 customer)`);
    console.log(`- ${createdBusinesses.length} businesses (3 approved, 1 pending)`);
    console.log(`- ${createdRoutes.length} routes with stops`);
    console.log(`- ${createdSchedules.length} schedules for 7 days`);
    console.log(`- ${createdTickets.length} tickets (some bookings)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding full data:', error);
    process.exit(1);
  }
};

seedFullData();
