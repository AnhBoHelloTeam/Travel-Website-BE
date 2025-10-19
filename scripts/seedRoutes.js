const mongoose = require('mongoose');
const Route = require('../models/Route');
const RouteStop = require('../models/RouteStop');
require('dotenv').config();

const sampleRoutes = [
  {
    from: 'Đà Nẵng',
    to: 'Quảng Trị',
    distance: 180, // km
    duration: 240, // minutes
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
      },
      {
        name: 'Văn phòng Huế',
        address: '456 Lê Lợi, Huế, Thừa Thiên Huế',
        coordinates: { lat: 16.4700, lng: 107.6000 },
        type: 'office',
        order: 4,
        estimatedTime: 135,
        isActive: true
      },
      {
        name: 'Bến xe Quảng Trị',
        address: 'Đông Hà, Quảng Trị',
        coordinates: { lat: 16.8167, lng: 107.1000 },
        type: 'bus_station',
        order: 5,
        estimatedTime: 240,
        isActive: true
      }
    ],
    isActive: true
  },
  {
    from: 'Hà Nội',
    to: 'Hải Phòng',
    distance: 120,
    duration: 150,
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
    from: 'TP. Hồ Chí Minh',
    to: 'Vũng Tàu',
    distance: 125,
    duration: 180,
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
        estimatedTime: 45,
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
  }
];

const seedRoutes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-website');
    console.log('Connected to MongoDB');

    // Clear existing routes and stops
    await Route.deleteMany({});
    await RouteStop.deleteMany({});
    console.log('Cleared existing routes and stops');

    // Create routes
    for (const routeData of sampleRoutes) {
      const { stops, ...routeInfo } = routeData;
      
      // Create route
      const route = await Route.create(routeInfo);
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

    console.log('✅ Routes and stops seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding routes:', error);
    process.exit(1);
  }
};

seedRoutes();