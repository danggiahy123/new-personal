# 🚀 VMware ESXi Management System

Hệ thống quản lý VMware ESXi hoàn chỉnh với Backend Node.js, Frontend React, và WebAdmin Portal.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tính năng](#tính-năng)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy dự án](#chạy-dự-án)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng quan

Dự án này cung cấp một giải pháp hoàn chỉnh để quản lý VMware ESXi thông qua web interface, bao gồm:

- **Backend API**: Node.js + Express với tích hợp ESXi REST API
- **Frontend**: React.js với giao diện quản lý VM thân thiện
- **WebAdmin**: Portal quản trị với logging và analytics
- **Authentication**: JWT + ESXi session management
- **SSL Bypass**: Hỗ trợ self-signed certificates

### ESXi Host Configuration
- **Host**: `https://192.168.159.128`
- **API**: REST API vCenter/vSphere
- **SSL**: Self-signed certificate (bypassed)

---

## 🏗️ Kiến trúc hệ thống

```
VMware ESXi Management System/
├── vmware-backend/          # Node.js API Server
│   ├── routes/              # API endpoints
│   ├── services/            # ESXi integration
│   ├── models/              # MongoDB models
│   ├── middleware/          # Authentication & security
│   └── server.js            # Main server
├── vmware-frontend/         # React Frontend
│   ├── src/pages/           # VM management pages
│   ├── src/services/        # API services
│   └── src/contexts/        # State management
└── vmware-webadmin/         # React Admin Portal
    ├── src/pages/           # Admin pages
    ├── src/components/      # Reusable components
    └── src/services/         # Admin services
```

### Tech Stack:

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Axios (ESXi API calls)
- JWT Authentication
- SSL bypass (rejectUnauthorized: false)

**Frontend:**
- React.js + React Router
- Tailwind CSS
- React Query (data fetching)
- React Hook Form
- Lucide Icons

**WebAdmin:**
- React.js + TypeScript
- Tailwind CSS
- Recharts (analytics)
- Role-based access control

---

## ✨ Tính năng

### 🔐 Authentication & Security
- [x] **Dual Authentication**: Application + ESXi credentials
- [x] **JWT Tokens**: Secure session management
- [x] **Role-based Access**: User/Admin roles
- [x] **SSL Bypass**: Self-signed certificate support
- [x] **Password Hashing**: Bcrypt encryption

### 🖥️ VM Management
- [x] **VM Listing**: View all virtual machines
- [x] **VM Details**: Detailed VM information
- [x] **Power Control**: Start/Stop/Restart VMs
- [x] **Real-time Status**: Live VM status updates
- [x] **Search & Filter**: Find VMs quickly

### 📊 Admin Features
- [x] **User Management**: Create/edit/delete users
- [x] **Activity Logging**: Track all VM operations
- [x] **Analytics Dashboard**: Charts and statistics
- [x] **System Monitoring**: ESXi connection status
- [x] **Audit Trail**: Complete action history

### 🎨 User Experience
- [x] **Responsive Design**: Mobile-friendly interface
- [x] **Modern UI**: Clean, professional design
- [x] **Real-time Updates**: Auto-refresh data
- [x] **Toast Notifications**: User feedback
- [x] **Loading States**: Smooth user experience

---

## 🚀 Cài đặt

### Yêu cầu hệ thống:
- **Node.js** >= 16.x
- **MongoDB** >= 4.4
- **ESXi Host** với REST API enabled

### 1. Clone repository
```bash
git clone <your-repo-url>
cd vmware-esxi-management
```

### 2. Cài đặt dependencies

#### Backend:
```bash
cd vmware-backend
npm install
```

#### Frontend:
```bash
cd vmware-frontend
npm install
```

#### WebAdmin:
```bash
cd vmware-webadmin
npm install
```

---

## ⚙️ Cấu hình

### 1. Backend Configuration

Tạo file `.env` trong `vmware-backend/`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vmware-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRE=7d

# ESXi Configuration
ESXI_HOST=https://192.168.159.128

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 2. ESXi Host Setup

Đảm bảo ESXi host có:
- REST API enabled
- User account với quyền quản lý VM
- Network access từ development machine

### 3. MongoDB Setup

```bash
# Start MongoDB
mongod

# Hoặc sử dụng MongoDB service
sudo systemctl start mongod
```

---

## 🏃‍♂️ Chạy dự án

### 1. Khởi động MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 2. Chạy Backend
```bash
cd vmware-backend
npm run dev
```
Backend sẽ chạy tại: **http://localhost:5000**

### 3. Chạy Frontend
```bash
cd vmware-frontend
npm start
```
Frontend sẽ chạy tại: **http://localhost:3000**

### 4. Chạy WebAdmin
```bash
cd vmware-webadmin
npm start
```
WebAdmin sẽ chạy tại: **http://localhost:3001**

---

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
```json
{
  "username": "admin",
  "password": "password123",
  "esxiUsername": "root",
  "esxiPassword": "esxi_password"
}
```

#### GET /api/auth/me
- Headers: `Authorization: Bearer <token>`

#### POST /api/auth/logout
- Headers: `Authorization: Bearer <token>`

### VM Management Endpoints

#### GET /api/vms
- Headers: `Authorization: Bearer <token>`
- Returns: List of all VMs

#### GET /api/vms/:id
- Headers: `Authorization: Bearer <token>`
- Returns: VM details

#### POST /api/vms/:id/start
- Headers: `Authorization: Bearer <token>`
- Action: Start VM

#### POST /api/vms/:id/stop
- Headers: `Authorization: Bearer <token>`
- Action: Stop VM

#### POST /api/vms/:id/restart
- Headers: `Authorization: Bearer <token>`
- Action: Restart VM

### Admin Endpoints (Admin only)

#### GET /api/admin/stats
- Headers: `Authorization: Bearer <token>`
- Returns: System statistics

#### GET /api/admin/users
- Headers: `Authorization: Bearer <token>`
- Returns: User list

#### GET /api/admin/logs
- Headers: `Authorization: Bearer <token>`
- Returns: Activity logs

---

## 🔧 Troubleshooting

### Lỗi thường gặp:

#### 1. ESXi Connection Error
```bash
# Kiểm tra ESXi host accessibility
ping 192.168.159.128

# Kiểm tra REST API
curl -k https://192.168.159.128/rest/com/vmware/cis/session
```

#### 2. SSL Certificate Error
- Backend đã được cấu hình để bypass SSL
- Kiểm tra `rejectUnauthorized: false` trong ESXi service

#### 3. Authentication Failed
- Kiểm tra ESXi credentials
- Đảm bảo user có quyền quản lý VM
- Kiểm tra ESXi host accessibility

#### 4. MongoDB Connection Error
```bash
# Kiểm tra MongoDB status
sudo systemctl status mongod

# Khởi động MongoDB
sudo systemctl start mongod
```

#### 5. CORS Error
- Kiểm tra CORS_ORIGIN trong backend .env
- Đảm bảo frontend URLs được thêm vào CORS_ORIGIN

### Debug Commands:

```bash
# Kiểm tra backend logs
cd vmware-backend && npm run dev

# Kiểm tra MongoDB connection
mongosh

# Test ESXi API
curl -k -u username:password https://192.168.159.128/rest/com/vmware/cis/session
```

---

## 🎯 Sử dụng

### 1. Đăng nhập Frontend
- Truy cập: http://localhost:3000
- Nhập Application credentials + ESXi credentials
- Quản lý VMs với giao diện thân thiện

### 2. Đăng nhập WebAdmin
- Truy cập: http://localhost:3001
- Nhập Admin credentials + ESXi credentials
- Xem analytics và quản lý users

### 3. Tạo Admin User
```bash
# Sử dụng MongoDB shell
mongosh
use vmware-management
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$12$...", // Hashed password
  role: "admin",
  isActive: true
})
```

---

## 🔒 Security Notes

- **JWT Secret**: Thay đổi JWT_SECRET trong production
- **ESXi Credentials**: Không lưu plain text passwords
- **HTTPS**: Sử dụng HTTPS trong production
- **Firewall**: Cấu hình firewall cho ESXi host
- **Access Control**: Giới hạn quyền truy cập ESXi

---

## 📈 Performance

- **Real-time Updates**: Auto-refresh mỗi 30 giây
- **Caching**: React Query caching
- **Pagination**: Large dataset support
- **Optimized Queries**: MongoDB indexes

---

## 🚀 Deployment

### Backend (Production):
```bash
cd vmware-backend
NODE_ENV=production npm start
```

### Frontend (Build):
```bash
cd vmware-frontend
npm run build
# Deploy build folder
```

### WebAdmin (Build):
```bash
cd vmware-webadmin
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

- VMware vSphere REST API
- React team
- Tailwind CSS team
- MongoDB team
- Tất cả các open source contributors

---

**Happy VMware Management! 🎉**
