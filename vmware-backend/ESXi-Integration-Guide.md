# VMware ESXi Integration Guide

## Tổng quan
Hệ thống này đã được tích hợp với VMware ESXi server tại `https://192.168.159.128` để quản lý máy ảo thông qua web interface.

## Cấu hình hiện tại

### ESXi Server
- **Địa chỉ**: `https://192.168.159.128`
- **Web Interface**: `https://192.168.159.128/ui/#/host`
- **API Type**: Web Interface (fallback từ REST API)

### Backend API
- **Port**: 5000
- **Base URL**: `http://localhost:5000`
- **Authentication**: JWT + ESXi credentials

## Cách sử dụng

### 1. Khởi động hệ thống
```bash
cd vmware-backend
node start-system.js
```

### 2. Truy cập frontend
- **VMware Frontend**: http://localhost:3000
- **VMware Web Admin**: http://localhost:3001

### 3. Đăng nhập
- **Username**: admin (hoặc tạo user mới)
- **Password**: password (hoặc mật khẩu tùy chỉnh)
- **ESXi Username**: root
- **ESXi Password**: password (hoặc mật khẩu ESXi của bạn)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập với ESXi credentials
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Thông tin user hiện tại

### VM Management
- `GET /api/vms` - Danh sách máy ảo
- `GET /api/vms/:id` - Chi tiết máy ảo
- `POST /api/vms/:id/start` - Khởi động máy ảo
- `POST /api/vms/:id/stop` - Tắt máy ảo
- `POST /api/vms/:id/restart` - Khởi động lại máy ảo

### Host Information
- `GET /api/host/info` - Thông tin ESXi host
- `GET /api/host/services` - Danh sách services
- `GET /api/host/storage` - Thông tin storage
- `GET /api/host/networking` - Thông tin network
- `GET /api/host/status` - Trạng thái kết nối

## Tính năng đã tích hợp

### ✅ Hoàn thành
1. **Kết nối ESXi**: Hệ thống có thể kết nối với ESXi server
2. **Authentication**: Đăng nhập với ESXi credentials
3. **VM Management**: Xem danh sách và thông tin máy ảo
4. **Host Information**: Thông tin cơ bản về ESXi host
5. **Web Interface Fallback**: Sử dụng web interface khi REST API không khả dụng
6. **Frontend Integration**: Dashboard hiển thị thông tin ESXi

### 🔄 Đang phát triển
1. **VM Control**: Start/Stop/Restart VMs (cần cấu hình thêm)
2. **Real-time Updates**: Cập nhật trạng thái real-time
3. **Advanced Features**: Tạo VM, cấu hình network, storage

## Cấu trúc dự án

```
vmware-backend/
├── services/
│   ├── esxiService.js          # Main ESXi service
│   ├── esxiWebService.js       # Web interface fallback
│   ├── esxiJsonRpcService.js   # JSON-RPC service
│   └── esxiSoapService.js      # SOAP service
├── routes/
│   ├── auth.js                 # Authentication routes
│   ├── vms.js                  # VM management routes
│   └── host.js                 # Host information routes
├── test-*.js                   # Test scripts
└── start-system.js             # System startup script
```

## Troubleshooting

### Lỗi kết nối ESXi
1. Kiểm tra ESXi server có hoạt động không
2. Kiểm tra network connectivity
3. Kiểm tra credentials (root/password)
4. Kiểm tra firewall settings

### Lỗi API
1. Kiểm tra backend server có chạy không
2. Kiểm tra CORS configuration
3. Kiểm tra JWT token
4. Kiểm tra ESXi authentication

### Lỗi frontend
1. Kiểm tra frontend server có chạy không
2. Kiểm tra API connection
3. Kiểm tra browser console for errors

## Test Scripts

### Kiểm tra kết nối ESXi
```bash
node test-esxi-connection.js
```

### Kiểm tra authentication
```bash
node test-esxi-auth.js
```

### Kiểm tra toàn bộ hệ thống
```bash
node test-final-integration.js
```

## Ghi chú

- Hệ thống hiện tại sử dụng web interface fallback vì REST API của ESXi server không khả dụng
- Có thể cần cấu hình thêm để sử dụng đầy đủ tính năng VM control
- ESXi server cần được cấu hình để cho phép API access
- Cần kiểm tra ESXi version và documentation để tương thích API

## Liên hệ

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng kiểm tra:
1. ESXi server logs
2. Backend server logs
3. Browser console errors
4. Network connectivity
