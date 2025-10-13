const mongoose = require('mongoose');
const Route = require('../models/Route');
require('dotenv').config();

const sampleRoutes = [
  {
    from: 'Đà Nẵng',
    to: 'Quảng Trị',
    distance: 120, // km
    duration: 180, // minutes
    stops: [
      {
        name: 'Bến xe Đà Nẵng',
        address: '123 Lê Duẩn, Hải Châu, Đà Nẵng',
        coordinates: { lat: 16.068, lng: 108.214 },
        type: 'bus_station',
        order: 1,
        estimatedTime: 0,
        isActive: true
      },
      {
        name: 'Văn phòng Tân Quang Dũng - Đà Nẵng',
        address: '456 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng',
        coordinates: { lat: 16.060, lng: 108.199 },
        type: 'office',
        order: 2,
        estimatedTime: 15,
        isActive: true
      },
      {
        name: 'Bến xe Huế',
        address: '789 An Dương Vương, Huế',
        coordinates: { lat: 16.449, lng: 107.595 },
        type: 'bus_station',
        order: 3,
        estimatedTime: 90,
        isActive: true
      },
      {
        name: 'Văn phòng Tân Quang Dũng - Huế',
        address: '321 Lê Lợi, Huế',
        coordinates: { lat: 16.466, lng: 107.594 },
        type: 'office',
        order: 4,
        estimatedTime: 105,
        isActive: true
      },
      {
        name: 'Bến xe Quảng Trị',
        address: '654 Hùng Vương, Quảng Trị',
        coordinates: { lat: 16.748, lng: 107.190 },
        type: 'bus_station',
        order: 5,
        estimatedTime: 180,
        isActive: true
      }
    ],
    isActive: true
  },
  {
    from: 'Hồ Chí Minh',
    to: 'Đà Lạt',
    distance: 300,
    duration: 360,
    stops: [
      {
        name: 'Bến xe Miền Đông',
        address: '123 Đinh Bộ Lĩnh, Bình Thạnh, HCM',
        coordinates: { lat: 10.803, lng: 106.713 },
        type: 'bus_station',
        order: 1,
        estimatedTime: 0,
        isActive: true
      },
      {
        name: 'Văn phòng Phương Trang - HCM',
        address: '456 Cách Mạng Tháng 8, Quận 10, HCM',
        coordinates: { lat: 10.776, lng: 106.667 },
        type: 'office',
        order: 2,
        estimatedTime: 30,
        isActive: true
      },
      {
        name: 'Trạm dừng chân Đồng Nai',
        address: '789 Quốc lộ 1A, Biên Hòa, Đồng Nai',
        coordinates: { lat: 10.944, lng: 106.822 },
        type: 'landmark',
        order: 3,
        estimatedTime: 120,
        isActive: true
      },
      {
        name: 'Bến xe Đà Lạt',
        address: '321 Phạm Ngũ Lão, Đà Lạt',
        coordinates: { lat: 11.943, lng: 108.441 },
        type: 'bus_station',
        order: 4,
        estimatedTime: 360,
        isActive: true
      }
    ],
    isActive: true
  }
];

async function seedRoutes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing routes
    await Route.deleteMany({});
    console.log('Cleared existing routes');

    // Insert sample routes
    const createdRoutes = await Route.insertMany(sampleRoutes);
    console.log(`Created ${createdRoutes.length} routes with stops`);

    // Display created routes
    createdRoutes.forEach(route => {
      console.log(`\nRoute: ${route.from} → ${route.to}`);
      console.log(`Stops: ${route.stops.length}`);
      route.stops.forEach(stop => {
        console.log(`  - ${stop.name} (${stop.estimatedTime}min)`);
      });
    });

  } catch (error) {
    console.error('Error seeding routes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seedRoutes();
}

module.exports = { seedRoutes };
