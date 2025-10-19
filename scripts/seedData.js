const mongoose = require('mongoose')
require('dotenv').config()

// Import models
const User = require('../models/User')
const Route = require('../models/Route')
const RouteStop = require('../models/RouteStop')
const Schedule = require('../models/Schedule')
const Ticket = require('../models/Ticket')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-website'

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data (except users)
    await Route.deleteMany({})
    await RouteStop.deleteMany({})
    await Schedule.deleteMany({})
    await Ticket.deleteMany({})
    console.log('Cleared existing data (except users)')

    // Get existing users
    const business1 = await User.findOne({ email: 'tanquangdung@bus.com' })
    const business2 = await User.findOne({ email: 'hoanglong@bus.com' })
    const customer1 = await User.findOne({ email: 'customer1@test.com' })
    const customer2 = await User.findOne({ email: 'customer2@test.com' })

    if (!business1) {
      console.log('⚠️ Business user tanquangdung@bus.com not found. Please create users first.')
      return
    }

    console.log('Found business user:', business1.email)

    // Create routes
    const routes = await Route.insertMany([
      {
        from: 'Đà Nẵng',
        to: 'Quảng Trị',
        distance: 120,
        duration: 180,
        businessId: business1._id
      },
      {
        from: 'TP.HCM',
        to: 'Đà Lạt',
        distance: 300,
        duration: 360,
        businessId: business1._id
      },
      {
        from: 'Hà Nội',
        to: 'Hải Phòng',
        distance: 100,
        duration: 120,
        businessId: business1._id
      },
      {
        from: 'Huế',
        to: 'Đà Nẵng',
        distance: 100,
        duration: 120,
        businessId: business1._id
      }
    ])
    console.log('✅ Created routes')

    // Create route stops
    const routeStops = []
    
    // Route 1: Đà Nẵng → Quảng Trị
    routeStops.push(...await RouteStop.insertMany([
      {
        routeId: routes[0]._id,
        name: 'Bến xe Đà Nẵng',
        address: '123 Lê Duẩn, Hải Châu, Đà Nẵng',
        estimatedTime: 0,
        order: 1,
        coordinates: { lat: 16.0544, lng: 108.2022 }
      },
      {
        routeId: routes[0]._id,
        name: 'Văn phòng 1 - Huế',
        address: '456 Nguyễn Huệ, Huế',
        estimatedTime: 60,
        order: 2,
        coordinates: { lat: 16.4637, lng: 107.5909 }
      },
      {
        routeId: routes[0]._id,
        name: 'Nhà xe Tân Quang Dũng',
        address: '789 Lê Lợi, Huế',
        estimatedTime: 90,
        order: 3,
        coordinates: { lat: 16.4637, lng: 107.5909 }
      },
      {
        routeId: routes[0]._id,
        name: 'Văn phòng 2 - Quảng Trị',
        address: '321 Hùng Vương, Quảng Trị',
        estimatedTime: 150,
        order: 4,
        coordinates: { lat: 16.7500, lng: 107.1833 }
      },
      {
        routeId: routes[0]._id,
        name: 'Bến xe Quảng Trị',
        address: '654 Trần Hưng Đạo, Quảng Trị',
        estimatedTime: 180,
        order: 5,
        coordinates: { lat: 16.7500, lng: 107.1833 }
      }
    ]))

    // Route 2: TP.HCM → Đà Lạt
    routeStops.push(...await RouteStop.insertMany([
      {
        routeId: routes[1]._id,
        name: 'Bến xe Miền Đông',
        address: '123 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM',
        estimatedTime: 0,
        order: 1,
        coordinates: { lat: 10.8231, lng: 106.6297 }
      },
      {
        routeId: routes[1]._id,
        name: 'Văn phòng Hoàng Long',
        address: '456 Nguyễn Văn Cừ, TP.HCM',
        estimatedTime: 30,
        order: 2,
        coordinates: { lat: 10.8231, lng: 106.6297 }
      },
      {
        routeId: routes[1]._id,
        name: 'Bến xe Đà Lạt',
        address: '789 Phạm Ngũ Lão, Đà Lạt',
        estimatedTime: 360,
        order: 3,
        coordinates: { lat: 11.9404, lng: 108.4583 }
      }
    ]))

    // Route 3: Hà Nội → Hải Phòng
    routeStops.push(...await RouteStop.insertMany([
      {
        routeId: routes[2]._id,
        name: 'Bến xe Mỹ Đình',
        address: '123 Phạm Hùng, Nam Từ Liêm, Hà Nội',
        estimatedTime: 0,
        order: 1,
        coordinates: { lat: 21.0285, lng: 105.8542 }
      },
      {
        routeId: routes[2]._id,
        name: 'Bến xe Lương Yên',
        address: '456 Lương Yên, Hai Bà Trưng, Hà Nội',
        estimatedTime: 30,
        order: 2,
        coordinates: { lat: 21.0285, lng: 105.8542 }
      },
      {
        routeId: routes[2]._id,
        name: 'Bến xe Hải Phòng',
        address: '789 Lê Lợi, Hải Phòng',
        estimatedTime: 120,
        order: 3,
        coordinates: { lat: 20.8449, lng: 106.6881 }
      }
    ]))

    // Route 4: Huế → Đà Nẵng
    routeStops.push(...await RouteStop.insertMany([
      {
        routeId: routes[3]._id,
        name: 'Bến xe Huế',
        address: '123 Lê Lợi, Huế',
        estimatedTime: 0,
        order: 1,
        coordinates: { lat: 16.4637, lng: 107.5909 }
      },
      {
        routeId: routes[3]._id,
        name: 'Bến xe Đà Nẵng',
        address: '456 Lê Duẩn, Đà Nẵng',
        estimatedTime: 120,
        order: 2,
        coordinates: { lat: 16.0544, lng: 108.2022 }
      }
    ]))

    console.log('✅ Created route stops')

    // Generate seats function
    const generateSeats = (capacity, seatLayout = '2-2') => {
      const seats = []
      const rows = Math.ceil(capacity / 4) // Assuming 4 seats per row for 2-2 layout
      
      for (let row = 1; row <= rows; row++) {
        const seatsInRow = row === rows ? capacity - (row - 1) * 4 : 4
        const seatLetters = ['A', 'B', 'C', 'D']
        
        for (let i = 0; i < seatsInRow; i++) {
          seats.push({
            seatNumber: `${row}${seatLetters[i]}`,
            isAvailable: Math.random() > 0.3, // 70% chance of being available
            seatType: Math.random() > 0.8 ? 'vip' : 'normal'
          })
        }
      }
      
      return seats
    }

    // Create schedules
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    const schedules = await Schedule.insertMany([
      // Route 1 schedules (Da Nang to Quang Tri)
      {
        routeId: routes[0]._id,
        businessId: business1._id,
        departureTime: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8 AM today
        arrivalTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11 AM today
        price: 150000,
        vehicleType: 'sitting',
        vehicleCategory: 'bus32',
        capacity: 32,
        seatLayout: '2-2',
        status: 'active',
        seats: generateSeats(32)
      },
      {
        routeId: routes[0]._id,
        businessId: business1._id,
        departureTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM today
        arrivalTime: new Date(today.getTime() + 17 * 60 * 60 * 1000), // 5 PM today
        price: 150000,
        vehicleType: 'sitting',
        vehicleCategory: 'bus32',
        capacity: 32,
        seatLayout: '2-2',
        status: 'active',
        seats: generateSeats(32)
      },
      {
        routeId: routes[0]._id,
        businessId: business1._id,
        departureTime: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000), // 8 AM tomorrow
        arrivalTime: new Date(tomorrow.getTime() + 11 * 60 * 60 * 1000), // 11 AM tomorrow
        price: 180000,
        vehicleType: 'sleeping',
        vehicleCategory: 'sleeper',
        capacity: 40,
        seatLayout: '2-1',
        status: 'active',
        seats: generateSeats(40, '2-1')
      },
      // Route 2 schedules (HCM to Da Lat)
      {
        routeId: routes[1]._id,
        businessId: business1._id,
        departureTime: new Date(today.getTime() + 6 * 60 * 60 * 1000), // 6 AM today
        arrivalTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM today
        price: 250000,
        vehicleType: 'sitting',
        vehicleCategory: 'limousine',
        capacity: 16,
        seatLayout: '2-1',
        status: 'active',
        seats: generateSeats(16, '2-1')
      },
      {
        routeId: routes[1]._id,
        businessId: business1._id,
        departureTime: new Date(tomorrow.getTime() + 22 * 60 * 60 * 1000), // 10 PM tomorrow
        arrivalTime: new Date(dayAfterTomorrow.getTime() + 4 * 60 * 60 * 1000), // 4 AM day after
        price: 300000,
        vehicleType: 'sleeping',
        vehicleCategory: 'sleeper',
        capacity: 40,
        seatLayout: '2-1',
        status: 'active',
        seats: generateSeats(40, '2-1')
      },
      // Route 3 schedules (Hanoi to Hai Phong)
      {
        routeId: routes[2]._id,
        businessId: business1._id,
        departureTime: new Date(today.getTime() + 7 * 60 * 60 * 1000), // 7 AM today
        arrivalTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM today
        price: 80000,
        vehicleType: 'sitting',
        vehicleCategory: 'bus16',
        capacity: 16,
        seatLayout: '2-2',
        status: 'active',
        seats: generateSeats(16)
      },
      {
        routeId: routes[2]._id,
        businessId: business1._id,
        departureTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1 PM today
        arrivalTime: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3 PM today
        price: 80000,
        vehicleType: 'sitting',
        vehicleCategory: 'bus16',
        capacity: 16,
        seatLayout: '2-2',
        status: 'active',
        seats: generateSeats(16)
      },
      // Route 4 schedules (Hue to Da Nang)
      {
        routeId: routes[3]._id,
        businessId: business1._id,
        departureTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM today
        arrivalTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11 AM today
        price: 100000,
        vehicleType: 'sitting',
        vehicleCategory: 'bus32',
        capacity: 32,
        seatLayout: '2-2',
        status: 'active',
        seats: generateSeats(32)
      }
    ])
    console.log('✅ Created schedules')

    // Create some sample tickets (only if customers exist)
    if (customer1 || customer2) {
      const sampleTickets = []
      
      if (customer1) {
        sampleTickets.push({
          scheduleId: schedules[0]._id,
          userId: customer1._id,
          seatNumber: '1A',
          passengerInfo: {
            firstName: 'Nguyễn Văn',
            lastName: 'A',
            phone: '0901234567',
            email: 'customer1@test.com'
          },
          paymentInfo: {
            method: 'momo',
            amount: 150000,
            transactionId: 'TXN_' + Date.now()
          },
          status: 'confirmed',
          pickupPoint: {
            name: 'Bến xe Đà Nẵng',
            address: '123 Lê Duẩn, Hải Châu, Đà Nẵng',
            estimatedTime: 0
          },
          dropoffPoint: {
            name: 'Bến xe Quảng Trị',
            address: '654 Trần Hưng Đạo, Quảng Trị',
            estimatedTime: 180
          }
        })
      }

      if (customer2) {
        sampleTickets.push({
          scheduleId: schedules[1]._id,
          userId: customer2._id,
          seatNumber: '2B',
          passengerInfo: {
            firstName: 'Trần Thị',
            lastName: 'B',
            phone: '0907654321',
            email: 'customer2@test.com'
          },
          paymentInfo: {
            method: 'banking',
            amount: 150000,
            transactionId: 'TXN_' + (Date.now() + 1)
          },
          status: 'pending',
          pickupPoint: {
            name: 'Văn phòng 1 - Huế',
            address: '456 Nguyễn Huệ, Huế',
            estimatedTime: 60
          },
          dropoffPoint: {
            name: 'Văn phòng 2 - Quảng Trị',
            address: '321 Hùng Vương, Quảng Trị',
            estimatedTime: 150
          }
        })
      }

      if (sampleTickets.length > 0) {
        await Ticket.insertMany(sampleTickets)
        console.log('✅ Created sample tickets')
      }
    }

    console.log('\n🎉 Data seeding completed successfully!')
    console.log('\n📊 Created data:')
    console.log(`- ${routes.length} routes`)
    console.log(`- ${routeStops.length} route stops`)
    console.log(`- ${schedules.length} schedules`)
    console.log(`- ${customer1 || customer2 ? '2' : '0'} sample tickets`)
    console.log('\n🚌 Available routes:')
    console.log('- Đà Nẵng → Quảng Trị (3 schedules)')
    console.log('- TP.HCM → Đà Lạt (2 schedules)')
    console.log('- Hà Nội → Hải Phòng (2 schedules)')
    console.log('- Huế → Đà Nẵng (1 schedule)')

  } catch (error) {
    console.error('❌ Error seeding data:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedData()
