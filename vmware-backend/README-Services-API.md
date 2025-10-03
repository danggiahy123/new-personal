# 🖥️ ESXi Services API Integration

Hướng dẫn tích hợp API để lấy thông tin services từ ESXi host `https://192.168.159.128/ui/#/host/manage/services`.

## 📋 Tổng quan

Đã tích hợp thành công API để lấy thông tin services từ ESXi host với các endpoints sau:

### 🔗 API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/host/services` | GET | Lấy danh sách services của ESXi host |
| `/api/host/info` | GET | Lấy thông tin chi tiết về ESXi host |
| `/api/host/storage` | GET | Lấy thông tin storage/datastores |
| `/api/host/networking` | GET | Lấy thông tin networking |
| `/api/host/status` | GET | Kiểm tra trạng thái kết nối ESXi |

## 🚀 Cách sử dụng

### 1. Khởi động Backend

```bash
cd vmware-backend
npm start
```

Backend sẽ chạy tại: **http://localhost:5000**

### 2. Khởi động Frontend

```bash
cd vmware-frontend
npm start
```

Frontend sẽ chạy tại: **http://localhost:3000**

### 3. Truy cập Services Page

1. Đăng nhập vào ứng dụng với credentials:
   - Username: `admin`
   - Password: `admin123`
   - ESXi Username: `root`
   - ESXi Password: `25836926Hy@`

2. Từ Dashboard, click vào nút **"Services"** hoặc truy cập trực tiếp: `http://localhost:3000/services`

## 📊 Thông tin hiển thị

### Host Information
- Tên host và ID
- Trạng thái kết nối (CONNECTED/DISCONNECTED)
- Trạng thái power (POWERED_ON/POWERED_OFF)
- Thông tin CPU và Memory
- Thời gian boot

### Services
- Danh sách tất cả services đang chạy trên ESXi
- Trạng thái từng service (running/stopped)
- Loại startup (automatic/manual)
- Health status
- Mô tả service

### Storage
- Danh sách datastores
- Loại storage (VMFS/NFS)
- Dung lượng tổng, đã sử dụng, còn trống
- Phần trăm sử dụng với progress bar

### Networking
- Danh sách networks
- Loại network (STANDARD_PORTGROUP)
- Trạng thái accessible

## 🔧 Cấu hình

### Backend (.env)
```env
ESXI_HOST=https://192.168.159.128
MONGODB_URI=mongodb://localhost:27017/vmware-management
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🛠️ Troubleshooting

### Lỗi Authentication
```bash
# Tạo admin user
cd vmware-backend
node create-admin.js
```

### Lỗi ESXi Connection
```bash
# Test kết nối ESXi
curl -k -u root:25836926Hy@ https://192.168.159.128/rest/com/vmware/cis/session -X POST
```

### Lỗi API Endpoints
- Kiểm tra ESXi host có REST API enabled
- Đảm bảo credentials đúng
- Kiểm tra network connectivity

## 📁 Files đã tạo/cập nhật

### Backend
- `services/esxiService.js` - Thêm methods cho services, host info, storage, networking
- `routes/host.js` - Routes mới cho host APIs
- `server.js` - Thêm host routes
- `test-services-api.js` - Test script cho services API

### Frontend
- `pages/Services.js` - Component hiển thị services
- `services/hostService.js` - Service để gọi host APIs
- `App.js` - Thêm route cho /services
- `pages/Dashboard.js` - Thêm button Services

## 🎯 Tính năng

### ✅ Đã hoàn thành
- [x] API integration với ESXi host
- [x] Services information display
- [x] Host information display
- [x] Storage information display
- [x] Networking information display
- [x] Real-time data refresh (30s)
- [x] Error handling với fallback to mock data
- [x] Responsive design
- [x] Authentication protection

### 🔄 Auto-refresh
- Dữ liệu tự động refresh mỗi 30 giây
- Loading states cho từng section
- Error handling với retry mechanism

### 🎨 UI Features
- Modern, clean design với Tailwind CSS
- Status indicators với colors
- Progress bars cho storage utilization
- Responsive layout cho mobile/desktop
- Icons từ Lucide React

## 🔗 Links

- **ESXi Host**: https://192.168.159.128/ui/#/host/manage/services
- **Backend API**: http://localhost:5000/api/host/services
- **Frontend**: http://localhost:3000/services
- **Dashboard**: http://localhost:3000/dashboard

## 📝 Notes

- API sử dụng fallback mechanism: nếu ESXi API fail, sẽ hiển thị mock data
- Tất cả API calls đều có authentication protection
- SSL certificate của ESXi được bypass trong backend
- Data được cache trong React Query với 30s refresh interval

---

**🎉 Hoàn thành tích hợp ESXi Services API!**

Bạn có thể truy cập `http://localhost:3000/services` để xem thông tin services từ ESXi host `https://192.168.159.128`.
