# Travel Website Backend

Backend API cho hệ thống đặt vé xe khách.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `env.example`:
```bash
cp env.example .env
```

3. Cập nhật các biến môi trường trong file `.env`

4. Chạy server:
```bash
# Development
npm run dev

# Production
npm start
```

## Cấu trúc dự án

```
Travel-Website-BE/
├── config/          # Cấu hình database, Redis
├── controllers/     # Logic xử lý request
├── middleware/      # Middleware functions
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── server.js        # Entry point
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Users
- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile

### Schedules
- `GET /api/schedules` - Lấy danh sách lịch trình
- `POST /api/schedules` - Tạo lịch trình mới
- `PUT /api/schedules/:id` - Cập nhật lịch trình
- `DELETE /api/schedules/:id` - Xóa lịch trình

### Tickets
- `GET /api/tickets` - Lấy danh sách vé
- `POST /api/tickets` - Đặt vé
- `PUT /api/tickets/:id` - Cập nhật vé
- `DELETE /api/tickets/:id` - Hủy vé

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String,
  role: String, // 'customer' | 'business' | 'admin'
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Schedules Collection
```javascript
{
  _id: ObjectId,
  routeId: ObjectId,
  departureTime: Date,
  arrivalTime: Date,
  price: Number,
  vehicleType: String,
  seats: [{
    seatNumber: String,
    isAvailable: Boolean
  }],
  businessId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Tickets Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  scheduleId: ObjectId,
  seatNumber: String,
  status: String, // 'pending' | 'confirmed' | 'cancelled'
  paymentInfo: {
    method: String,
    transactionId: String,
    amount: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```
