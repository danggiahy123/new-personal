# 🚀 FullStack Mobile App Project

Dự án full-stack với Backend Node.js + MongoDB, Frontend Mobile React Native Expo, và WebAdmin React.js + Tailwind CSS.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc dự án](#kiến-trúc-dự-án)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Chạy dự án](#chạy-dự-án)
- [API Documentation](#api-documentation)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Tính năng](#tính-năng)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng quan

Dự án này bao gồm:

- **Backend**: Node.js + Express + MongoDB
- **Mobile App**: React Native với Expo
- **Web Admin**: React.js + TypeScript + Tailwind CSS

### Tính năng chính:
- ✅ Authentication (Đăng nhập/Đăng ký)
- ✅ User Management (Quản lý người dùng)
- ✅ Product Management (Quản lý sản phẩm)
- ✅ Responsive Design
- ✅ Real-time Updates
- ✅ Security Features

---

## 🏗️ Kiến trúc dự án

```
fullstack-mobile-app/
├── backend/          # Node.js API Server
├── mobile/           # React Native Mobile App
├── webadmin/         # React.js Web Admin
└── package.json      # Root package.json
```

### Tech Stack:

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt Password Hashing
- Express Validator
- Helmet Security
- CORS

**Mobile App:**
- React Native + Expo
- React Navigation
- React Native Paper
- Axios
- React Hook Form
- Context API

**Web Admin:**
- React.js + TypeScript
- Tailwind CSS
- React Router
- React Query
- React Hook Form
- Lucide Icons

---

## 💻 Yêu cầu hệ thống

### Phần mềm cần thiết:
- **Node.js** >= 16.x
- **npm** >= 8.x
- **MongoDB** >= 4.4
- **Expo CLI** (cho mobile app)
- **Git**

### Cài đặt MongoDB:
```bash
# Windows (sử dụng Chocolatey)
choco install mongodb

# macOS (sử dụng Homebrew)
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Hoặc sử dụng MongoDB Atlas (cloud)
```

---

## 🚀 Cài đặt

### 1. Clone repository
```bash
git clone <your-repo-url>
cd fullstack-mobile-app
```

### 2. Cài đặt dependencies cho tất cả projects
```bash
# Cài đặt root dependencies
npm install

# Cài đặt tất cả dependencies
npm run install:all
```

### 3. Cấu hình Environment Variables

#### Backend (.env):
```bash
# Copy file example
cp backend/env.example backend/.env

# Chỉnh sửa backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fullstack-app
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

#### Mobile App:
Cập nhật API_BASE_URL trong `mobile/src/services/authService.js` và `mobile/src/services/productService.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

#### Web Admin:
Cập nhật API_BASE_URL trong `webadmin/src/services/authService.ts` và `webadmin/src/services/productService.ts`:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 🏃‍♂️ Chạy dự án

### 1. Khởi động MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# hoặc
mongod
```

### 2. Chạy Backend
```bash
cd backend
npm run dev
```
Backend sẽ chạy tại: http://localhost:5000

### 3. Chạy Web Admin
```bash
cd webadmin
npm start
```
Web Admin sẽ chạy tại: http://localhost:3000

### 4. Chạy Mobile App
```bash
cd mobile
npm start
```
Sau đó scan QR code bằng Expo Go app trên điện thoại.

### 5. Chạy tất cả cùng lúc (Development)
```bash
# Từ root directory
npm run dev
```

---

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
- Headers: `Authorization: Bearer <token>`

### User Endpoints

#### GET /api/users
- Headers: `Authorization: Bearer <token>`
- Query: `?page=1&limit=10`

#### GET /api/users/:id
- Headers: `Authorization: Bearer <token>`

#### PUT /api/users/:id
- Headers: `Authorization: Bearer <token>`
- Body: User data

#### DELETE /api/users/:id
- Headers: `Authorization: Bearer <token>`

### Product Endpoints

#### GET /api/products
- Query: `?page=1&limit=10&category=electronics&search=phone`

#### GET /api/products/:id

#### POST /api/products
- Headers: `Authorization: Bearer <token>`
- Body: Product data

#### PUT /api/products/:id
- Headers: `Authorization: Bearer <token>`

#### DELETE /api/products/:id
- Headers: `Authorization: Bearer <token>`

---

## 📁 Cấu trúc thư mục

```
fullstack-mobile-app/
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # External services
│   ├── tests/          # Test files
│   ├── uploads/        # File uploads
│   ├── server.js       # Main server file
│   └── package.json
│
├── mobile/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── navigation/   # Navigation setup
│   │   ├── screens/      # App screens
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   ├── assets/          # Images, fonts, etc.
│   ├── App.js          # Main app component
│   └── package.json
│
├── webadmin/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   ├── public/         # Static files
│   ├── src/index.tsx   # Main entry point
│   └── package.json
│
└── package.json        # Root package.json
```

---

## ✨ Tính năng

### 🔐 Authentication
- [x] User Registration
- [x] User Login/Logout
- [x] JWT Token Authentication
- [x] Password Hashing
- [x] Protected Routes

### 👥 User Management
- [x] User Profile Management
- [x] Role-based Access Control
- [x] User List with Pagination
- [x] User Status Management

### 📦 Product Management
- [x] Product CRUD Operations
- [x] Product Categories
- [x] Product Search & Filter
- [x] Product Images
- [x] Stock Management

### 📱 Mobile App Features
- [x] Cross-platform (iOS/Android)
- [x] Offline Support
- [x] Push Notifications
- [x] Camera Integration
- [x] Responsive Design

### 🌐 Web Admin Features
- [x] Dashboard Analytics
- [x] User Management Interface
- [x] Product Management Interface
- [x] Real-time Updates
- [x] Responsive Design

---

## 🔧 Troubleshooting

### Lỗi thường gặp:

#### 1. MongoDB Connection Error
```bash
# Kiểm tra MongoDB đang chạy
sudo systemctl status mongod

# Khởi động MongoDB
sudo systemctl start mongod
```

#### 2. Port Already in Use
```bash
# Tìm process đang sử dụng port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

#### 3. Expo App không kết nối được
- Kiểm tra IP address trong API_BASE_URL
- Đảm bảo backend đang chạy
- Kiểm tra firewall settings

#### 4. CORS Error
- Kiểm tra CORS_ORIGIN trong backend/.env
- Đảm bảo frontend URL được thêm vào CORS_ORIGIN

#### 5. JWT Token Error
- Kiểm tra JWT_SECRET trong backend/.env
- Đảm bảo token được gửi đúng format: `Bearer <token>`

### Debug Commands:

```bash
# Kiểm tra MongoDB connection
mongosh

# Kiểm tra backend logs
cd backend && npm run dev

# Kiểm tra mobile app logs
cd mobile && npx expo start --clear

# Kiểm tra web admin logs
cd webadmin && npm start
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:

1. Kiểm tra [Troubleshooting](#troubleshooting) section
2. Xem logs của từng service
3. Kiểm tra network connectivity
4. Đảm bảo tất cả dependencies đã được cài đặt

---

## 🚀 Deployment

### Backend (Heroku/Railway/DigitalOcean):
```bash
cd backend
# Cấu hình production environment variables
# Deploy với platform của bạn
```

### Mobile App (Expo/EAS Build):
```bash
cd mobile
npx eas build --platform all
```

### Web Admin (Vercel/Netlify):
```bash
cd webadmin
npm run build
# Deploy build folder
```

---

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 👥 Contributors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- React Native team
- Expo team
- Tailwind CSS team
- MongoDB team
- Tất cả các open source contributors

---

**Happy Coding! 🎉**