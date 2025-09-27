# Cấu trúc dự án Backend - Phần mềm Quản lý Bán Vé Xe

## Tổng quan
Dự án backend được xây dựng với **Node.js/Express**, sử dụng **MongoDB** với **Mongoose** làm database, tích hợp **Redis** cho caching, **Socket.IO** cho chat real-time, và **Nodemailer** cho gửi email. Cấu trúc dự án được thiết kế tối ưu cho MVP, dễ bảo trì và mở rộng.

## Cấu trúc thư mục
```
TicketBooking_Backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Cấu hình kết nối MongoDB và Redis
│   │   ├── email.js           # Cấu hình Nodemailer
│   │   └── socket.js          # Cấu hình Socket.IO
│   ├── models/
│   │   ├── User.js            # Model người dùng (khách hàng, nhà xe)
│   │   ├── Schedule.js        # Model lịch trình xe
│   │   ├── Ticket.js          # Model vé xe
│   │   ├── Chat.js            # Model lịch sử chat
│   │   └── Business.js        # Model thông tin nhà xe
│   ├── routes/
│   │   ├── auth.js            # API đăng ký/đăng nhập
│   │   ├── tickets.js         # API tìm kiếm, đặt, hủy vé
│   │   ├── schedules.js       # API quản lý lịch trình
│   │   ├── users.js           # API quản lý tài khoản người dùng
│   │   ├── chats.js           # API quản lý lịch sử chat
│   │   └── business.js        # API quản lý nhà xe
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── errorHandler.js    # Xử lý lỗi chung
│   │   ├── validation.js      # Validation input
│   │   └── rateLimit.js       # Rate limiting
│   ├── services/
│   │   ├── payment.js         # Tích hợp cổng thanh toán (Momo/VNPAY)
│   │   ├── emailService.js    # Gửi email xác nhận
│   │   └── seatService.js     # Quản lý trạng thái ghế (Redis)
│   ├── tests/
│   │   ├── auth.test.js       # Unit tests cho auth
│   │   ├── tickets.test.js    # Unit tests cho vé
│   │   ├── schedules.test.js  # Unit tests cho lịch trình
│   │   └── setup.js           # Cấu hình test
│   └── server.js              # Main server file
├── scripts/
│   └── seedData.js            # Script seed dữ liệu mẫu
├── package.json               # Dependencies & scripts
├── Dockerfile                 # Docker configuration
├── docker-compose.yml        # Multi-container setup
├── jest.config.js            # Test configuration
├── .eslintrc.js              # Code linting rules
├── mongo-init.js             # MongoDB initialization
├── env.example               # Environment variables template
└── README.md                 # Documentation
```

## Tính năng chính
1. **Authentication System**
   - Đăng ký/đăng nhập với JWT và Google OAuth.
   - Password hashing với bcrypt.
   - Role-based access control (customer, business, admin).

2. **Ticket Management**
   - Tìm kiếm vé theo điểm đi/đến, ngày giờ, loại xe.
   - Đặt vé với sơ đồ ghế và giữ chỗ tạm thời (Redis).
   - Hủy vé với chính sách thời gian và phí.

3. **Schedule Management**
   - CRUD operations cho lịch trình xe.
   - Bộ lọc lịch trình theo ngày, tuyến, loại xe.

4. **User Management**
   - Quản lý profile khách hàng và nhà xe.
   - Lịch sử đặt vé và trạng thái ghế.

5. **Real-time Chat**
   - Chatbox hỗ trợ khách hàng với Socket.IO.
   - Lưu lịch sử chat vào MongoDB.

6. **Business Management**
   - Đăng ký và xác minh nhà xe.
   - Dashboard nhà xe: quản lý vé, lịch trình, tranh chấp.

7. **Security & Performance**
   - HTTPS, JWT, bcrypt, Helmet.
   - Rate limiting với express-rate-limit.
   - Caching với Redis.
   - Input validation với Joi.

## Cài đặt và chạy dự án
### 1. Cài đặt dependencies
```bash
cd TicketBooking_Backend
npm install
```

### 2. Cấu hình environment
```bash
cp env.example .env
# Chỉnh sửa file .env với thông tin MongoDB, Redis, Momo/VNPAY, Nodemailer
```

**Ví dụ file .env:**
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/ticket_booking
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
MOMO_API_KEY=your_momo_api_key
VNPAY_API_KEY=your_vnpay_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 3. Chạy MongoDB và Redis
```bash
# Sử dụng Docker
docker-compose up -d

# Hoặc chạy local
mongod
redis-server
```

### 4. Seed dữ liệu mẫu
```bash
npm run seed
```

### 5. Chạy ứng dụng
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints chính
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/me`
- **Tickets**: `/api/tickets/search`, `/api/tickets/book`, `/api/tickets/cancel`, `/api/tickets/:id`
- **Schedules**: `/api/schedules`, `/api/schedules/:id`
- **Users**: `/api/users/profile`, `/api/users/tickets`
- **Chats**: `/api/chats/history`, `/api/chats/message`
- **Business**: `/api/business/register`, `/api/business/dashboard`, `/api/business/disputes`

## Database Schema (Mongoose)
### User
```javascript
const userSchema = new mongoose.Schema({
  user_id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'business', 'admin'], default: 'customer' },
  profile: {
    name: String,
    phone: String,
    address: String
  }
}, { timestamps: true });
```

### Schedule
```javascript
const scheduleSchema = new mongoose.Schema({
  route_id: { type: String, required: true },
  departure_time: { type: Date, required: true },
  price: { type: Number, required: true },
  vehicle_type: { type: String, enum: ['seat', 'bed'], required: true },
  seats: [{
    seat_number: String,
    status: { type: String, enum: ['available', 'booked', 'locked'], default: 'available' }
  }]
}, { timestamps: true });
```

### Ticket
```javascript
const ticketSchema = new mongoose.Schema({
  ticket_id: { type: String, unique: true, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  seat_number: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  payment_info: {
    method: String,
    status: String,
    transaction_id: String
  }
}, { timestamps: true });
```

### Chat
```javascript
const chatSchema = new mongoose.Schema({
  chat_id: { type: String, unique: true, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    sender: { type: String, enum: ['user', 'support'], required: true },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
```

### Business
```javascript
const businessSchema = new mongoose.Schema({
  business_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  license: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  services: [String],
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
}, { timestamps: true });
```

## Testing
```bash
# Chạy tests
npm test

# Test với coverage
npm run test:coverage
```

## File package.json
```json
{
  "name": "ticket-booking-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "seed": "node scripts/seedData.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "redis": "^4.6.0",
    "socket.io": "^4.5.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "nodemailer": "^6.9.0",
    "express-rate-limit": "^6.7.0",
    "helmet": "^6.0.0",
    "joi": "^17.7.0"
  },
  "devDependencies": {
    "jest": "^29.3.1",
    "supertest": "^6.3.0",
    "nodemon": "^2.0.20",
    "eslint": "^8.30.0"
  }
}
```

## File server.js
```javascript
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const config = require('./config/database');
const socketConfig = require('./config/socket');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const scheduleRoutes = require('./routes/schedules');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const businessRoutes = require('./routes/business');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(helmet());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/business', businessRoutes);

// Error handling
app.use(errorHandler);

// Socket.IO
socketConfig(io);

// Connect to DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
```

## Lưu ý
- **Bảo mật**: Đảm bảo sử dụng HTTPS và cấu hình Helmet để bảo vệ headers.
- **Tích hợp thanh toán**: Sử dụng SDK chính thức của Momo/VNPAY, kiểm tra kỹ trạng thái giao dịch.
- **Chat real-time**: Socket.IO được cấu hình để xử lý tin nhắn tức thời và lưu lịch sử chat.
- **Hiệu năng**: Redis được sử dụng để lưu trạng thái ghế tạm thời (5 phút) và cache dữ liệu lịch trình.

Backend đã sẵn sàng để tích hợp với frontend React. Các API endpoints được thiết kế để hỗ trợ tất cả các tính năng MVP yêu cầu.